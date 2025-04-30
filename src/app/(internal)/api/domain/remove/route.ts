import { NextResponse } from 'next/server'
import Domains from '@/utils/domainController'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    const chat_id = searchParams.get('chat_id')

    if (!domain || typeof domain !== 'string' || !chat_id) {
      return NextResponse.json(
        { message: 'Domain is required and must be a string' },
        { status: 400 }
      )
    }

    const apiToken = process.env.VERCEL_API_TOKEN as string
    const domainManager = new Domains(apiToken)

    await domainManager.remove('prj_AsOkV9gOzltpGobAyOGn742us2Xb', domain)

    // Remove domain from database
    await prisma.domain.deleteMany({
      where: {
        name: domain,
        chat_id: chat_id,
      },
    })

    return NextResponse.json({ message: 'Domain removed successfully' })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
