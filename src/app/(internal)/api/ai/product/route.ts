import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Inicializa o cliente OpenAI fora do handler para reutilização
// Ele automaticamente pega a chave de process.env.OPENAI_API_KEY
const openai = new OpenAI();

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    // 1. Extrair o input necessário do corpo da requisição
    const body = await request.json();
    const userInput = body.prompt || body.question; // Suporta ambos os formatos

    if (!userInput) {
      return NextResponse.json(
        { error: "Input 'prompt' ou 'question' não fornecido no corpo da requisição." },
        { status: 400 }
      );
    }

    // 2. Chamar a API da OpenAI com um sistema prompt avançado
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em marketing digital e desenvolvimento de produtos infoprodutos digitais. Sua tarefa é criar descrições de produtos digitais persuasivos, convincentes e irresistíveis seguindo as diretrizes abaixo:

DIRETRIZES PARA CRIAÇÃO DE PRODUTOS DIGITAIS IRRESISTÍVEIS:

1. NAMING:
   - Crie um nome impactante que inclua estes elementos:
     * Um termo de autoridade ("método", "sistema", "fórmula", "protocolo")
     * Um adjetivo impressionante ("revolucionário", "explosivo", "avançado")
     * Um benefício claro e específico
     * Um elemento de exclusividade/propriedade (usar termos como "do especialista", "[nome] method")
   - O nome deve ser simples, memorável e comunicar claramente o benefício principal

2. PROMESSAS:
   - Defina uma promessa principal clara e específica (o que o cliente vai conseguir)
   - Adicione 3-5 sub-promessas complementares que reforcem o benefício principal
   - Inclua um elemento de prazo ou velocidade para os resultados
   - Enfatize a facilidade de implementação

3. MECANISMO:
   - Crie um nome para o sistema/método usado no produto (ex: "Sistema 5R", "Método DNA da Conversão")
   - Explique brevemente como o mecanismo funciona usando termos simples
   - Mencione por que esse mecanismo é superior a outros métodos convencionais
   - Use uma linguagem que transmita inovação e exclusividade

4. OFERTA:
   - Liste 5-7 módulos ou componentes incluídos no produto
   - Para cada módulo, inclua:
     * Nome cativante
     * Breve descrição do conteúdo
     * Principal benefício/resultado desse módulo
   - Destaque qualquer bônus ou extras especiais
   - Enfatize o valor total da oferta

5. LINGUAGEM E FORMATAÇÃO:
   - Use linguagem direta, personalizada e focada no benefício
   - Inclua termos de urgência e escassez quando apropriado
   - Estruture o texto em parágrafos curtos e diretos
   - Use marcadores e sublistas para facilitar a leitura
   - Inclua uma ou duas frases de autoridade que estabeleçam credibilidade

6. RECURSOS ESPECÍFICOS PARA INFOPRODUTOS:
   - Mencione o formato do produto (curso online, e-book, mentorias, etc.)
   - Sugira a duração ou extensão do conteúdo
   - Indique se há suporte ou comunidade incluída
   - Mencione acesso vitalício ou limitações de tempo, se aplicável

IMPORTANTE: Seu texto deve ser altamente persuasivo, emocional quando apropriado, e focado totalmente nos benefícios para o cliente, não nas características do produto. Personalize completamente baseado no tipo de produto, gênero, faixa etária e mercado de atuação fornecidos no prompt.`,
        },
        { role: 'user', content: userInput },
      ],
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 1500,
    });

    // 3. Extrair a resposta gerada
    const generatedContent = completion.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('Não foi possível obter conteúdo da OpenAI.');
    }

    // 4. Retornar a resposta gerada
    return NextResponse.json({ 
      result: generatedContent,
      text: generatedContent // Para compatibilidade com o componente CreateProductButton
    });
  } catch (error: unknown) {
    console.error('Erro ao chamar OpenAI:', error);

    // Verifica se é um erro da API da OpenAI para dar mais detalhes
    if (error instanceof OpenAI.APIError) {
      console.error(
        'OpenAI API Error:',
        error.status,
        error.message,
        error.code,
        error.type
      );
      return NextResponse.json(
        { error: `Erro da API OpenAI: ${error.message}` },
        { status: error.status || 500 }
      );
    } else if (error instanceof Error) {
      // Trata outros erros genéricos que possuem a propriedade message
      return NextResponse.json(
        { error: `Erro ao processar requisição AI: ${error.message}` },
        { status: 500 }
      );
    } else {
      // Trata casos onde o erro não é um objeto Error padrão
      return NextResponse.json(
        { error: 'Erro interno desconhecido ao processar requisição AI' },
        { status: 500 }
      );
    }
  }
}
