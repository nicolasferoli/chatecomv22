import { NextResponse } from 'next/server'

export interface ProdutoGeniusResponse {
  count: number
  next: string | null
  previous: string | null
  results: ProdutoGenius[]
}

export interface ProdutoGenius {
  id: number
  order: string
  emailUsuario: string
  nomeProduto: string
  infoProduto: string
  beneficiosProduto: string | null
  objecoesProduto: string | null
  prosecontraProduto: string | null
  motivosProduto: string | null
  perdasProduto: string | null
  modulosProduto: string | null
  modulo1Produto: string | null
  modulo2Produto: string | null
  modulo3Produto: string | null
  modulo4Produto: string | null
  modulo5Produto: string | null
  modulo6Produto: string | null
  orderbumpProduto: string | null
  headlineProduto: string | null
  descricaoProduto: string | null
  infoPersona: string | null
  caracteristicasPersona: string | null
  nichos: string | null
  nichoEscolhido: string
  Data: string
  link: string
}

const BASE_URL =
  'https://baserow.comunidadeecom.com/api/database/rows/table/497'
const AUTH_TOKEN = process.env.GENIUS_TOKEN

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `${BASE_URL}/?user_field_names=true&filters=%7B%22filter_type%22%3A%22AND%22%2C%22filters%22%3A%5B%7B%22type%22%3A%22equal%22%2C%22field%22%3A%22emailUsuario%22%2C%22value%22%3A%22${email}%22%7D%5D%2C%22groups%22%3A%5B%5D%7D`,
      {
        method: 'GET',
        headers: {
          Authorization: `Token ${AUTH_TOKEN}`,
        },
      }
    )

    if (!response.ok) {
      console.error(response)
      throw new Error('Erro ao buscar produtos')
    }

    const data: ProdutoGeniusResponse = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const response = await fetch(`${BASE_URL}/${id}/?user_field_names=true`, {
      method: 'GET',
      headers: {
        Authorization: `Token ${AUTH_TOKEN}`,
      },
    })

    if (!response.ok) {
      throw new Error('Erro ao buscar produto')
    }

    const data: ProdutoGenius = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao buscar produto' }, { status: 500 })
  }
}