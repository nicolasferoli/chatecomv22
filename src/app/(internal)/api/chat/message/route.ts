import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

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
    console.log('💬 -> Criando nova mensagem:', body)
    const { chatId, type, content } = body

    // Validar dados obrigatórios
    if (!chatId || !type || !content) {
      console.log('⚠️ -> Dados inválidos:', { chatId, type, content })
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    // Criar mensagem com ID único
    const message = await prisma.message.create({
      data: {
        id: uuidv4(),
        chatId,
        type,
        content,
      },
    })

    console.log('✅ -> Mensagem criada:', message)
    return NextResponse.json(message)
  } catch (error) {
    console.log('❌ -> Erro ao criar mensagem:', error)
    return NextResponse.json(
      { error: 'Erro ao criar mensagem' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')
    console.log('🔍 -> Buscando mensagens do chat:', chatId)

    if (!chatId) {
      console.log('⚠️ -> ChatId não fornecido')
      return NextResponse.json(
        { error: 'ChatId é obrigatório' },
        { status: 400 }
      )
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        position: true,
        type: true,
        content: true,
        from: true,
        chatId: true,
        variableId: true,
        createdAt: true,
        updatedAt: true,
        variable: true,
      },
    })

    console.log('✅ -> Mensagens encontradas:', messages.length)
    return NextResponse.json(messages)
  } catch (error) {
    console.log('❌ -> Erro ao buscar mensagens:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar mensagens' },
      { status: 500 }
    )
  }
}
