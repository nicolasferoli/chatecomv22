import { NextRequest, NextResponse } from 'next/server'
import Domains from '@/utils/domainController'

const token = process.env.VERCEL_API_TOKEN || ''
const domainManager = new Domains(token)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const projectId =
    searchParams.get('projectId') || 'prj_AsOkV9gOzltpGobAyOGn742us2Xb'
  const domain = searchParams.get('domain')

  if (!projectId || !domain) {
    return NextResponse.json(
      { message: 'Missing or invalid projectId or domain' },
      { status: 400 }
    )
  }

  try {
    const data = await domainManager.get(projectId, domain)
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
