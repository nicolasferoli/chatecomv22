import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const origin = searchParams.get('origin')

  if (!origin) {
    return NextResponse.json({ message: 'Origin inválido' }, { status: 400 })
  }

  try {
    // Busca o quiz com o origin definido em .domain.domain
    console.log(origin)
    const chat = await prisma.chat.findFirst({
      where: {
        domain: {
          path: ['domain'],
          equals: origin,
        },
      },
    })

    if (chat) {
      return NextResponse.json(chat)
    } else {
      return NextResponse.json(
        { message: 'Chat não encontrado' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Erro ao buscar quiz:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
