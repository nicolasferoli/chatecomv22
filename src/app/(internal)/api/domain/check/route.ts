import { checkDNS, checkPing } from '@/utils/dns'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Domains from '@/utils/domainController'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const domain = searchParams.get('domain')
  const chat_id = searchParams.get('chat_id')
  if (!domain || !chat_id) {
    return NextResponse.json(
      { message: 'Missing or invalid domain parameter' },
      { status: 400 }
    )
  }

  const apiToken = process.env.VERCEL_API_TOKEN as string;
  const domainManager = new Domains(apiToken);
  const result = await domainManager.get("prj_AsOkV9gOzltpGobAyOGn742us2Xb", domain);

  if(result.verification) {
    return NextResponse.json({ message: "Insira o DNS TXT do domínio", status: "migrate", dns: result.verification });
  }

  const dnsResult = await checkDNS(domain);
  const pingResult = await checkPing(domain);

  const valid = dnsResult.valid && pingResult

  if (valid) {
    await prisma?.domain.create({
      data: {
        name: domain,
        status: 'verified',
        chat_id: chat_id,
      },
    })
  }

  return NextResponse.json({
    valid,
    message: valid
      ? 'Domain is valid'
      : 'O domínio não está configurado, adicione a DNS e tente novamente',
    dnsMessage: dnsResult.message,
  })
}
