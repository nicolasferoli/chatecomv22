import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { Message } from '@/types'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { Prisma } from '@prisma/client'

export const maxDuration = 30

export async function POST(request: Request) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { chatId, messages } = body
    console.log('📝 -> Criando mensagens em lote:', { chatId, messages })

    // Validar dados obrigatórios
    if (!chatId || !messages?.length) {
      console.log('⚠️ -> Dados inválidos:', { chatId, messages })
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    // Filtrar mensagens válidas
    const validMessages = messages.filter((msg) => {
      if (msg.type === 'text') {
        return msg.content?.text && msg.content.text.trim() !== ''
      }
      if (msg.type === 'question') {
        return (
          msg.content?.text &&
          msg.content.text.trim() !== '' &&
          msg.content.options
        )
      }
      return false
    })

    if (!validMessages.length) {
      console.log('⚠️ -> Nenhuma mensagem válida para criar')
      return NextResponse.json({ messages: [] })
    }

    // Criar mensagens em transação
    const createdMessages: any = await prisma.$transaction(
      validMessages.map((msg, index) =>
        prisma.message.create({
          data: {
            id: uuidv4(),
            position: index,
            chatId,
            type: msg.type,
            content: msg.content,
          },
        })
      ),
      {
        maxWait: 20000, // 5 seconds max wait to connect to prisma
        timeout: 20000, // 20 seconds
      }
    )

    console.log('✅ -> Mensagens criadas:', createdMessages.length)
    return NextResponse.json(createdMessages)
  } catch (error) {
    console.log('❌ -> Erro ao criar mensagens:', error)
    return NextResponse.json(
      { error: 'Erro ao criar mensagens' },
      { status: 500 }
    )
  }
}

const generateCaseClauses = (messages: Message[]) => {
  return Prisma.join(
    messages.map(
      (m, i) => Prisma.sql`WHEN id = ${m.id} THEN ${i}` // Comparação direta com string
    ),
    ' '
  )
}

export async function PUT(request: Request) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📝 -> Atualizando mensagens em lote:', body)
    const { chatId, messages } = body

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    })

    if (!chat) {
      console.log('⚠️ -> Chat não encontrado:', chatId)
      return NextResponse.json(
        { error: 'Chat não encontrado' },
        { status: 404 }
      )
    }

    const result = await prisma.$executeRaw`
    UPDATE messages
    SET position = CASE
      ${generateCaseClauses(messages)}
      ELSE position
    END
    WHERE id IN (${Prisma.join(messages.map((m) => m.id))})
  `

    console.log('✅ -> Mensagens atualizadas:', result)
    return NextResponse.json(result)
  } catch (error) {
    console.log('❌ -> Erro ao atualizar mensagens em lote:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar mensagens em lote' },
      { status: 500 }
    )
  }
}
