import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const domain = searchParams.get('domain')

  if (!domain) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
  }

  try {
    const domains = await prisma.domain.findMany({
      where: {
        name: domain,
        status: 'verified',
      },
      select: {
        id: true,
        name: true,
        status: true,
        chat_id: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(domains)
  } catch (error) {
    console.error('Error fetching domains:', error)
    return NextResponse.json(
      { error: 'Failed to fetch domains' },
      { status: 500 }
    )
  }
}
