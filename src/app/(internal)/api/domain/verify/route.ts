import { NextResponse } from 'next/server'
import VercelDomainManager from '@/utils/domainController'

const token = process.env.VERCEL_API_TOKEN || ''
const domainManager = new VercelDomainManager(token)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { domain } = body

    const response = await domainManager.verify(
      'prj_AsOkV9gOzltpGobAyOGn742us2Xb',
      domain
    )

    return NextResponse.json(response)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
