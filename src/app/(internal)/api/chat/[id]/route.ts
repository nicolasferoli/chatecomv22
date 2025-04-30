import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    const body = await request.json()

    console.log('📝 -> Atualizando chat:', body)

    const existingChat = await prisma.chat.findUnique({
      where: { id },
    })

    if (!existingChat) {
      return NextResponse.json(
        { error: 'Chat não encontrado' },
        { status: 404 }
      )
    }

    const mergedData = {
      ...existingChat,
      ...body,
    }

    const chat = await prisma.chat.update({
      where: { id },
      data: mergedData,
    })

    console.log('✅ -> Chat atualizado:', chat)
    return NextResponse.json(chat)
  } catch (error) {
    console.log('❌ -> Erro ao atualizar chat:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar chat' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const id = url.pathname.split('/').pop()
  const chat = await prisma.chat.findUnique({ where: { id } })
  const domains = await prisma.domain.findMany({ where: { chat_id: id } })
  return NextResponse.json({ ...chat, domains })
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()

    console.log('🗑️ -> Deletando chat:', id)

    const existingChat = await prisma.chat.findUnique({
      where: { id },
    })

    if (!existingChat) {
      return NextResponse.json(
        { error: 'Chat não encontrado' },
        { status: 404 }
      )
    }

    const chat = await prisma.chat.delete({
      where: { id },
    })

    console.log('✅ -> Chat deletado:', chat)
    return NextResponse.json(chat)
  } catch (error) {
    console.log('❌ -> Erro ao deletar chat:', error)
    return NextResponse.json({ error: 'Erro ao deletar chat' }, { status: 500 })
  }
}
