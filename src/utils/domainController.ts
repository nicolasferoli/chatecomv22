import fetch, { Response } from 'node-fetch'

interface DomainVerification {
  type: string
  domain: string
  value: string
}

interface DomainResponse {
  apexName: string
  createdAt: number
  customEnvironmentId: string | null
  gitBranch: string | null
  name: string
  projectId: string
  redirect: string | null
  redirectStatusCode: 307 | 301 | 302 | 308 | null
  updatedAt: number
  verification: DomainVerification[]
  verified: boolean
}

interface AddDomainRequestBody {
  name: string
  gitBranch?: string
  redirect?: string
  redirectStatusCode?: 307 | 301 | 302 | 308
}

class Domains {
  private apiUrl = 'https://api.vercel.com'
  private token: string
  private teamId: string = 'team_mPSyAUbZdPxBvAPlPlMOg0CD'
  private slug: string = 'grupoecom'

  constructor(token: string) {
    this.token = token
  }

  private async fetchApi(
    endpoint: string,
    method: string,
    body?: object
  ): Promise<Response> {
    const url = new URL(`${this.apiUrl}${endpoint}`)
    url.searchParams.append('teamId', this.teamId)
    url.searchParams.append('slug', this.slug)

    const headers = {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    }

    return await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  public async add(
    projectId: string,
    domainBody: AddDomainRequestBody
  ): Promise<DomainResponse> {
    const response = await this.fetchApi(
      `/v10/projects/${projectId}/domains`,
      'POST',
      domainBody
    )
    if (!response.ok) {
      throw new Error(`Failed to add domain: ${response.statusText}`)
    }
    return (await response.json()) as DomainResponse
  }

  public async verify(
    projectId: string,
    domain: string
  ): Promise<DomainResponse> {
    const response = await this.fetchApi(
      `/v10/projects/${projectId}/domains/${domain}/verify`,
      'POST'
    )
    if (!response.ok) {
      throw new Error(`Failed to verify domain: ${response.statusText}`)
    }
    return (await response.json()) as DomainResponse
  }

  // Novo método para obter informações do domínio
  public async get(projectId: string, domain: string): Promise<DomainResponse> {
    const response = await this.fetchApi(
      `/v9/projects/${projectId}/domains/${domain}`,
      'GET'
    )
    if (!response.ok) {
      throw new Error(`Failed to get domain info: ${response.statusText}`)
    }
    return (await response.json()) as DomainResponse
  }

  public async remove(projectId: string, domain: string): Promise<void> {
    const response = await this.fetchApi(
      `/v10/projects/${projectId}/domains/${domain}`,
      'DELETE'
    )
    if (!response.ok) {
      throw new Error(`Failed to remove domain: ${response.statusText}`)
    }
  }
}

export default Domains
