import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const { chatId, answer, messageIndex, runId } = await request.json()

  if (!chatId || !answer || messageIndex === undefined || !runId) {
    return Response.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  }

  try {
    // Busca a mensagem atual
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


    if (!chat) {
      return Response.json({ error: 'Chat not found' }, { status: 404 })
    }
    
    const messagesWihoutSection = chat.messages.filter(message => message.type !== 'section')
    const currentMessage = messagesWihoutSection[messageIndex]

    if (!currentMessage) {
      return Response.json({ error: 'Message not found' }, { status: 404 })
    }

    console.log('currentMessage', currentMessage)

    // Se for uma pergunta, salva a variável
    if (currentMessage.type === 'question') {
      const content = currentMessage.content as {
        text: string
        options: { variable: string }
      }

      // Salva a variável com o runId
      await prisma.variable.create({
        data: {
          name: content.options.variable,
          value: answer,
          chatId,
          runId,
        },
      })

    console.log('Variável salva com sucesso')
    console.log({
      name: content.options.variable,
      value: answer,
      chatId,
      runId,
    })
    }



    return Response.json({
      data: {
        success: true,
        nextIndex: messageIndex + 1,
      },
    })
  } catch (error) {
    console.error('Error processing answer:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
