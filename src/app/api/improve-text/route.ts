import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Inicializa o cliente OpenAI com a chave da API do ambiente
// Certifique-se de ter OPENAI_API_KEY definida no seu .env.local
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    // 1. Extrair o texto da requisição
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: 'Texto é obrigatório' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
       console.error('Chave da API da OpenAI não configurada no servidor'); // Log no servidor
       return NextResponse.json({ error: 'Erro interno do servidor: Chave da API não configurada.' }, { status: 500 });
    }

    // 2. Chamar a API da OpenAI (Chat Completions)
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Ou outro modelo de sua preferência (ex: "gpt-4")
      messages: [
        {
          role: "system",
          // Instrução para a IA
          content: "Você é um assistente de escrita. Reescreva o texto a seguir para torná-lo mais claro, conciso e profissional, corrigindo quaisquer erros gramaticais ou de estilo."
        },
        {
          role: "user",
          // O texto original do usuário
          content: text
        }
      ],
      temperature: 0.7, // Ajuste a criatividade (0 a 2)
      max_tokens: 1000, // Ajuste o limite máximo de tokens na resposta
    });

    // 3. Extrair a resposta da IA
    const improvedText = chatCompletion.choices[0]?.message?.content?.trim();

    if (!improvedText) {
        console.error('Não foi possível obter uma resposta válida da IA:', chatCompletion);
        throw new Error('Não foi possível obter uma resposta válida da IA.');
    }

    // 4. Retornar o texto melhorado
    return NextResponse.json({ text: improvedText });

  } catch (error) {
    console.error('Erro ao chamar a API da OpenAI:', error);
    // Retorna uma mensagem de erro genérica mais informativa se possível
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao processar a solicitação com a IA';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 