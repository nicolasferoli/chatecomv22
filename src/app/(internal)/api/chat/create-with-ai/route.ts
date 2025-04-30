import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import axios from 'axios'
import OpenAI from 'openai'

export const maxDuration = 300;

// Inicializa o cliente OpenAI
const openai = new OpenAI();

// Função para processar o fluxo (output da IA ou template direto) no formato específico
async function processCustomFlow(customFlow: string, chatId: string) {
  try {
    console.log('📝 -> Processando fluxo para inserção no DB')
    
    // Separar os grupos do fluxo
    const groups = customFlow.split('---').filter(group => group.trim().length > 0)
    let position = 0
    
    for (const group of groups) {
      // Extrair o título do grupo (seção)
      const groupTitleMatch = group.match(/## \*\*(.*?)\*\*/);
      const groupTitle = groupTitleMatch ? groupTitleMatch[1].trim() : null; // Trim title
      
      if (groupTitle) {
        await prisma.message.create({
          data: {
            id: uuidv4(),
            position: position++,
            chatId,
            type: 'section',
            content: {
              text: groupTitle
            },
            from: 'bot',
          }
        })
      }
      
      // Dividir o grupo em linhas para processar cada tipo de mensagem
      const lines = group.split('\n').filter(line => line.trim().length > 0 && !line.trim().startsWith('##')) // Ignore title line now
      
      let currentMessage = ''
      let currentType = ''
      let delayValue = 0
      let options: any = null
      let buttonList: any[] = []
      let lastValidTextLineForContext = '' // Store last text for context
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        
        // Ignore empty lines or comments (optional, good practice)
        if (!line || line.startsWith('//')) continue;
        
        // Update last text line for context if it's a Text line
        if (line.startsWith('**Texto**:') || line.startsWith('**Depoimento**:')) {
          lastValidTextLineForContext = line.replace(/\*\*(Texto|Depoimento)\*\*:/, '').trim();
        }
        
        // Flush previous message if type changes or specific tags appear
        const shouldFlush = 
          // Treat Depoimento the same as Text for flushing
          ((line.startsWith('**Texto**:') || line.startsWith('**Depoimento**:')) && currentType !== 'text' && currentType !== '') || 
          (line.startsWith('**Áudio**:') && currentType !== 'audio' && currentType !== '') ||
          (line.startsWith('**Imagem**:') && currentType !== 'image' && currentType !== '') ||
          (line.startsWith('**[INPUT]**')) ||
          (line.startsWith('**Link**:')) ||
          (line.startsWith('- ') && currentType !== 'buttons' && currentType !== '') ||
          (line.startsWith('[Aguarde')) ||
          (line.startsWith('**Embed vídeo**:') && currentType !== 'embed' && currentType !== '');
        
        if (shouldFlush && currentMessage && currentType) {
          await createMessage(chatId, currentType, currentMessage, position++, delayValue, options, buttonList)
          // Reset state for next message block, except delay
          currentMessage = ''
          options = null
          buttonList = []
          delayValue = 0 // Reset delay after using it
        }
        
        // Process tags
        if (line.startsWith('**Texto**:') || line.startsWith('**Depoimento**:')) {
          currentType = 'text'
          currentMessage = line.replace(/\*\*(Texto|Depoimento)\*\*:/, '').trim()
          // Apply accumulated delay if any
          const delayMatch = currentMessage.match(/[Aguarde (\d+) segundos]$/i);
          if (delayMatch) {
            delayValue = parseInt(delayMatch[1]) * 1000;
            currentMessage = currentMessage.replace(delayMatch[0], '').trim(); // Remove delay tag from text
          }
        }
        else if (line.startsWith('**Áudio**:')) {
          currentType = 'audio'
          currentMessage = line.replace('**Áudio**:', '').trim()
          // Apply accumulated delay
          const delayMatch = currentMessage.match(/[Aguarde (\d+) segundos]$/i);
          if (delayMatch) {
            delayValue = parseInt(delayMatch[1]) * 1000;
            currentMessage = currentMessage.replace(delayMatch[0], '').trim(); 
          }
        }
        else if (line.startsWith('**Imagem**:')) {
          currentType = 'image'
          currentMessage = line.replace('**Imagem**:', '').trim() // Expecting URL here
          // Apply accumulated delay
          const delayMatch = currentMessage.match(/[Aguarde (\d+) segundos]$/i);
          if (delayMatch) {
            delayValue = parseInt(delayMatch[1]) * 1000;
            currentMessage = currentMessage.replace(delayMatch[0], '').trim();
          }
        }
        else if (line.startsWith('**[INPUT]**')) {
          currentType = 'question'
          // Use the last text line as the question context
          currentMessage = lastValidTextLineForContext || 'Por favor, responda:';
          
          const variableMatch = line.match(/[coletar (.*?)]/i)
          options = { type: 'text', variable: 'resposta' } // Default
          if (variableMatch && variableMatch[1]) {
            const varName = variableMatch[1].toLowerCase().trim()
            if (varName === 'email') options = { type: 'email', variable: 'email' }
            else if (['telefone', 'whatsapp', 'wpp'].includes(varName)) options = { type: 'wpp', variable: 'telefone' }
            else if (varName === 'cpf') options = { type: 'cpf', variable: 'cpf' }
            else if (['numero', 'number'].includes(varName)) options = { type: 'number', variable: 'numero' }
            else if (varName !== '') options = { type: 'text', variable: varName } // Use the specific variable name
          }
        }
        else if (line.startsWith('**Link**:')) {
          currentType = 'redirect'
          const linkContent = line.replace('**Link**:', '').trim();
          // Try to extract markdown link first
          const linkMatch = linkContent.match(/\[(.*?)\]\((.*?)\)/);
          if (linkMatch && linkMatch[1] && linkMatch[2]) {
            currentMessage = linkMatch[1]; // Text part
            options = { url: linkMatch[2] }; // URL part
          } else {
            // If no markdown, assume the whole content is the URL
            currentMessage = 'Clique aqui'; // Default text
            options = { url: linkContent };
          }
          // Apply accumulated delay
          const delayTagMatch = currentMessage.match(/[Aguarde (\d+) segundos]$/i);
          if (delayTagMatch) {
            delayValue = parseInt(delayTagMatch[1]) * 1000;
            currentMessage = currentMessage.replace(delayTagMatch[0], '').trim(); 
          }
        }
        else if (line.startsWith('- ')) { // Button processing
          if (currentType !== 'buttons') {
            // If starting buttons, the previous text line is the context
            currentMessage = lastValidTextLineForContext || 'Escolha uma opção:';
            currentType = 'buttons';
            buttonList = []; // Ensure button list is clean
            options = null; // Clear options from previous message type
          }
          const buttonText = line.replace('- ', '').trim();
          if(buttonText) buttonList.push({ id: uuidv4(), text: buttonText });
        }
        else if (line.startsWith('[Aguarde') && line.includes('segundos]')) {
          // This is a standalone delay, apply to the *next* message
          const delayMatch = line.match(/[Aguarde (\d+) segundos]/i)
          if (delayMatch && delayMatch[1]) {
            delayValue = parseInt(delayMatch[1]) * 1000
          }
          // Don't set message/type, just store delay for the next block
          currentMessage = '' // Clear any potential leftover message
          currentType = ''    // Clear type
        }
        else if (line.startsWith('**Embed vídeo**:')) {
          currentType = 'embed'
          currentMessage = line.replace('**Embed vídeo**:', '').trim()
          // Apply accumulated delay
          const delayMatch = currentMessage.match(/[Aguarde (\d+) segundos]$/i);
          if (delayMatch) {
            delayValue = parseInt(delayMatch[1]) * 1000;
            currentMessage = currentMessage.replace(delayMatch[0], '').trim(); 
          }
        }
        else if (line && !line.startsWith('##')) {
          // Treat unrecognized lines as potential text continuation if previous was text
          if (currentType === 'text') {
            currentMessage += '\n' + line; // Append to existing text message
          } else {
            console.warn(`Linha não reconhecida no processador de fluxo: ${line}`)
          }
        }
        
        // If it's the last line, flush the last message
        if (i === lines.length - 1 && currentType && currentMessage) {
          await createMessage(chatId, currentType, currentMessage, position++, delayValue, options, buttonList)
        }
      }
    }
    
    console.log('✅ -> Fluxo processado e inserido no DB')
    return true
  } catch (error) {
    console.error('❌ -> Erro ao processar fluxo personalizado:', error)
    return false
  }
}

// Função auxiliar para criar mensagens no banco de dados
async function createMessage(
  chatId: string, 
  type: string, 
  content: string, 
  position: number, 
  delayValue: number = 0, 
  options: any = null, 
  buttonList: any[] = []
) {
  try {
    switch (type) {
      case 'text':
        return await prisma.message.create({
          data: {
            id: uuidv4(),
            position,
            chatId,
            type: 'text',
            content: { text: content, hasDynamicDelay: delayValue > 0, delayValue },
            from: 'bot',
          }
        })
      case 'question':
        return await prisma.message.create({
          data: {
            id: uuidv4(),
            position,
            chatId,
            type: 'question',
            content: { text: content, options, hasDynamicDelay: delayValue > 0, delayValue },
            from: 'bot',
          }
        })
      case 'audio':
        return await prisma.message.create({
          data: {
            id: uuidv4(),
            position,
            chatId,
            type: 'audio',
            content: { text: content, url: content, hasDynamicDelay: delayValue > 0, delayValue },
            from: 'bot',
          }
        })
      case 'image':
        return await prisma.message.create({
          data: {
            id: uuidv4(),
            position,
            chatId,
            type: 'image',
            content: { text: content, url: content, hasDynamicDelay: delayValue > 0, delayValue },
            from: 'bot',
          }
        })
      case 'embed':
        return await prisma.message.create({
          data: {
            id: uuidv4(),
            position,
            chatId,
            type: 'embed',
            content: { text: content, url: content, hasDynamicDelay: delayValue > 0, delayValue },
            from: 'bot',
          }
        })
      case 'buttons':
        // Extrair apenas o texto dos botões antes de salvar
        const buttonTexts = buttonList.map(btn => btn.text);
        return await prisma.message.create({
          data: {
            id: uuidv4(),
            position,
            chatId,
            type: 'buttons',
            content: { text: content, buttons: buttonTexts, hasDynamicDelay: delayValue > 0, delayValue }, // Salvar como string[]
            from: 'bot',
          }
        })
      case 'redirect':
        return await prisma.message.create({
          data: {
            id: uuidv4(),
            position,
            chatId,
            type: 'redirect',
            content: { text: content, url: options?.url || '#', hasDynamicDelay: delayValue > 0, delayValue },
            from: 'bot',
          }
        })
      case 'section':
        return await prisma.message.create({
          data: {
            id: uuidv4(),
            position,
            chatId,
            type: 'section',
            content: { text: content },
            from: 'bot',
          }
        })
      default:
        // Ensure the warning doesn't trigger for 'testimonial' anymore
        if (type !== 'text' && type !== 'question' && type !== 'audio' && type !== 'image' && type !== 'embed' && type !== 'buttons' && type !== 'redirect' && type !== 'section') {
             console.warn(`Tipo de mensagem desconhecido '${type}' ao criar mensagem, tratando como texto.`);
        }
        return await prisma.message.create({
          data: {
            id: uuidv4(),
            position,
            chatId,
            type: 'text',
            content: { text: content, hasDynamicDelay: delayValue > 0, delayValue },
            from: 'bot',
          }
        })
    }
  } catch (error) {
    console.error(`❌ -> Erro ao criar mensagem tipo ${type}:`, error)
    return null
  }
}

// Função principal da API
export async function POST(request: Request) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user || !user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, type, prompt, platform, template_type } = body
    const userId = user.id

    console.log('🤖 -> Recebida requisição para criar chatbot com IA:', { name, type, template_type, platform })

    // 1. Criar o registro inicial do Chat
    const newChat = await prisma.chat.create({
      data: {
        id: uuidv4(),
        name: name || 'Novo Chat',
        type: type || 'ecommerce',
        theme: platform || 'whatsapp',
        user_id: userId,
        bot_name: "Assistente",
      },
    })
    const chatId = newChat.id
    console.log(`🚀 -> Chat inicial criado com ID: ${chatId}`)

    // 2. Construir o prompt para GPT-4o Mini
    const aiPrompt = `
      Você é um especialista em criar fluxos de chatbot conversacionais e eficazes.
      Tarefa: Gerar um fluxo completo de chatbot baseado nas informações do produto e no template de estrutura fornecidos abaixo.

      INFORMAÇÕES DO PRODUTO:
      --- START PRODUCT INFO ---
      ${prompt.product_info || 'Produto sem descrição detalhada.'}
      --- END PRODUCT INFO ---

      TEMPLATE DE ESTRUTURA DESEJADO (${template_type || 'Geral'}):
      --- START TEMPLATE STRUCTURE ---
      ${prompt.custom_flow || '## Seção 1\n**Texto**: Olá! Fale sobre o produto.\n**Input**: [coletar EMAIL]'}
      --- END TEMPLATE STRUCTURE ---

      INSTRUÇÕES IMPORTANTES:
      1.  Siga a estrutura geral e a intenção de cada grupo/seção do template fornecido.
      2.  Adapte o conteúdo das mensagens (textos, áudios) para incorporar as INFORMAÇÕES DO PRODUTO de forma natural e persuasiva.
      3.  Mantenha os marcadores de sintaxe EXATAMENTE como no exemplo: \`## **Nome Grupo**\`, \`**Texto**:\`, \`**Áudio**:\`, \`**Imagem**:\`, \`**Input**: [coletar VARIAVEL]\`, \`**Link**: [Texto do Link](URL)\`, \`[Aguarde X segundos]\`, \`- Texto do botão\`.\n      4.  Use os placeholders como \`[NOME]\` onde apropriado.\n      5.  Para \`[Áudio]:\`, escreva a transcrição do áudio entre aspas.\n      6.  Para \`**Input**: [coletar VARIAVEL]\`, use variáveis como NOME, EMAIL, WHATSAPP, ou um nome descritivo para outras coletas.\n      7.  Para Prova Social (se houver no template), use nomes e locais fictícios, mas mantenha a estrutura.\n      8.  Gere o fluxo completo, começando do primeiro ao último grupo do template.\n      9.  Responda APENAS com o fluxo gerado, sem introduções, comentários ou explicações adicionais.\n      10. Use o idioma Português do Brasil.\n

      FLUXO DO CHATBOT GERADO:
    `;

    // 3. Chamar a API da OpenAI com GPT-4o Mini
    console.log('🧠 -> Enviando prompt para OpenAI (gpt-4o-mini)...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // <-- SPECIFY GPT-4o Mini
      messages: [{ role: "user", content: aiPrompt }],
      temperature: 0.7, // Um pouco de criatividade, mas mantendo a estrutura
      // max_tokens: 3000, // Adjust if needed, mini might have smaller context/output limits
    });

    const aiGeneratedFlow = completion.choices[0]?.message?.content;

    if (!aiGeneratedFlow) {
      throw new Error('Falha ao gerar o fluxo pela IA: Resposta vazia.');
    }

    console.log('✨ -> Fluxo gerado pela IA recebido.');
    // console.log(aiGeneratedFlow); // Log optional for debugging the raw AI output

    // 4. Processar o fluxo gerado pela IA para criar as mensagens no DB
    const processingSuccess = await processCustomFlow(aiGeneratedFlow, chatId);

    if (!processingSuccess) {
      // Mesmo que o processamento falhe, o chat foi criado. Talvez retornar o ID?
      // Ou deletar o chat inicial? Por enquanto, vamos logar e retornar erro.
      console.error(`❌ -> Falha ao processar e salvar o fluxo gerado pela IA para o chat ${chatId}`);
      // Opcional: deletar o chat criado se o fluxo falhar
      // await prisma.chat.delete({ where: { id: chatId } });
      throw new Error('Falha ao processar o fluxo gerado pela IA.');
    }

    // 5. Retornar o ID do Chat criado com sucesso
    console.log(`✅ -> Chatbot ${chatId} criado com sucesso usando IA e template ${template_type}!`);
    return NextResponse.json({ id: chatId }, { status: 201 })

  } catch (error) {
    console.error('❌ -> Erro geral na criação do chatbot com IA:', error)
    // Se o chat inicial foi criado mas houve erro depois, talvez deletar?
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 })
  }
} 