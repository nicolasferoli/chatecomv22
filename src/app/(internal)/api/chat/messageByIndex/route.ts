import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const chatId = searchParams.get('chatId')
  const messageIndex = parseInt(searchParams.get('messageIndex') || '0')
  const runId = searchParams.get('runId')

  if (!chatId || messageIndex === undefined || !runId) {
    return Response.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  }

  try {
    // Busca o chat com suas mensagens
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    //console.log('chat', chat)

    if (!chat) {
      return Response.json({ error: 'Chat not found' }, { status: 404 })
    }

    // Obtém a mensagem atual
    const message = chat.messages.filter(
      (message) => message.type !== 'section'
    )[messageIndex]

    //console.log('message', message)

    if (!message) {
      return Response.json({ completed: true })
    }

    // Se for uma mensagem de texto, processa as variáveis
    if (message.type === 'text' || message.type === 'question') {
      const content = message.content as { text: string }
      let messageText = content.text

      // Procura por variáveis no formato {variavel}
      const variableMatches = messageText.match(/\{([^}]+)\}/g)

      if (variableMatches) {
        // Busca as variáveis desta execução
        const variables = await prisma.variable.findMany({
          where: {
            chatId,
            runId,
          },
        })

        // Substitui as variáveis pelos seus valores
        for (const variable of variableMatches) {
          const varName = variable.slice(1, -1)
          const foundVar = variables.find((v) => v.name === varName)

          if (foundVar) {
            messageText = messageText.replace(variable, foundVar.value)
          }
        }

        message.content = { text: messageText }
      }
    }

    return Response.json({
      message,
      completed: messageIndex >= chat.messages.length,
    })
  } catch (error) {
    console.error('Error loading message:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
