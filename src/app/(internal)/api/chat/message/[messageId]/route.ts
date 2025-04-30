import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

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

    const url = new URL(request.url)
    const messageId = url.pathname.split('/').pop()
    console.log('📝 -> Atualizando mensagem:', messageId)
    const body = await request.json()
    const { type, content } = body

    // Verificar se a mensagem existe
    const existingMessage = await prisma.message.findUnique({
      where: { id: messageId },
    })

    // Verifica se o chat pertence ao usuário
    const chat = await prisma.chat.findUnique({
      where: { id: existingMessage?.chatId },
    })

    if (!existingMessage || chat?.user_id !== user.id) {
      console.log(
        '⚠️ -> Mensagem não encontrada ou chat não pertence ao usuário:',
        messageId
      )
      return NextResponse.json(
        { error: 'Mensagem não encontrada' },
        { status: 404 }
      )
    }

    const message = await prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        type,
        content,
      },
    })

    console.log('✅ -> Mensagem atualizada:', message)
    return NextResponse.json(message)
  } catch (error) {
    console.log('❌ -> Erro ao atualizar mensagem:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar mensagem' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const messageId = url.pathname.split('/').pop()
    console.log('🗑️ -> Deletando mensagem:', messageId)

    // Verificar se a mensagem existe
    const existingMessage = await prisma.message.findUnique({
      where: { id: messageId },
    })

    // Verifica se o chat pertence ao usuário
    const chat = await prisma.chat.findUnique({
      where: { id: existingMessage?.chatId },
    })

    if (!existingMessage || chat?.user_id !== user.id) {
      console.log(
        '⚠️ -> Mensagem não encontrada ou chat não pertence ao usuário:',
        messageId
      )
      return NextResponse.json(
        { error: 'Mensagem não encontrada' },
        { status: 404 }
      )
    }

    await prisma.message.delete({
      where: {
        id: messageId,
      },
    })

    console.log('✅ -> Mensagem deletada:', messageId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.log('❌ -> Erro ao deletar mensagem:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar mensagem' },
      { status: 500 }
    )
  }
}
