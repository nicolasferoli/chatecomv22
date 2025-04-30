import dns from 'dns/promises'

interface DNSCheckResult {
  valid: boolean
  message: string
}

export async function checkDNS(domain: string): Promise<DNSCheckResult> {
  try {
    const records = await dns.resolve(domain, 'A')

    const isValid = records.includes('76.76.21.21')

    return isValid
      ? { valid: true, message: 'DNS record is correct' }
      : { valid: false, message: 'DNS record does not match 76.76.21.21' }
  } catch (error) {
    return { valid: false, message: 'DNS lookup failed' }
  }
}

export async function checkPing(domain: string): Promise<boolean> {
  try {
    const response = await fetch('https://' + domain + '/api/domain/ping')
    const data = await response.json()
    return data.active === true
  } catch (error) {
    return false
  }
}
