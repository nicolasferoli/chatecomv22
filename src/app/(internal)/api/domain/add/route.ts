import { NextResponse } from 'next/server'
import Domains from '@/utils/domainController'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { domain, chat_id } = body

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json(
        { message: 'Domain is required and must be a string' },
        { status: 400 }
      )
    }

    const apiToken = process.env.VERCEL_API_TOKEN as string
    const domainManager = new Domains(apiToken)

    try {
      const result = await domainManager.add(
        'prj_AsOkV9gOzltpGobAyOGn742us2Xb',
        {
          name: domain,
        }
      )
      console.log(result)
      return NextResponse.json({ message: 'Domain added successfully', result })
    } catch (error: any) {
      console.log(error)
      if (error.message.includes('Failed to add domain: Conflict')) {
        const result = await domainManager.get(
          'prj_AsOkV9gOzltpGobAyOGn742us2Xb',
          domain
        )
        console.log(result)
        return NextResponse.json({
          message: 'Insira o DNS TXT do domínio',
          status: 'migrate',
          dns: result.verification,
        })
      }
      return NextResponse.json({ message: error.message }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Error processing request' },
      { status: 400 }
    )
  }
}
