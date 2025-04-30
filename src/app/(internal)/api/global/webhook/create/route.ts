import { NextResponse } from 'next/server'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

async function getAccessToken(
  client_id: string,
  client_secret: string
): Promise<string> {
  const response = await fetch(process.env.KINDE_ISSUER_URL + '/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id,
      client_secret,
      audience: process.env.KINDE_ISSUER_URL + '/api',
    }),
  })
  const data = await response.json()
  return data.access_token
}

async function updateUserProps(
  userId: string,
  values: {
    [prop: string]: string | boolean
  },
  accessToken: string
): Promise<any> {
  try {
    const user = await axios.patch<any>(
      `${process.env.KINDE_ISSUER_URL}/api/v1/users/${userId}/properties`,
      {
        properties: values,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    return user
  } catch (error: any) {
    console.log(error.response?.data)

    // throw error
  }
}

async function addUser(userData: any, accessToken: string): Promise<any> {
  try {
    const response = await fetch(
      `${process.env.KINDE_ISSUER_URL}/api/v1/user`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identities: [
            {
              type: 'email',
              details: {
                email: userData.email,
              },
            },
          ],
          profile: {
            given_name: userData.name,
          },
        }),
      }
    )
    const data = await response.json()
    return data
  } catch (error: any) {
    console.log(error)
    // throw error
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  const body = await request.json()

  console.log('🔔 Gateway event received:', body.type)
  console.log('🔔 Token:', token)

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 400 })
  }

  if (token !== process.env.GLOBAL_WEBHOOK_TOKEN) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 400 })
  }

  // Verificações
  const { name, email, gateway, type, plan, payment_value } = body

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 })
  }

  const typesAllowed = ['sub_confirmed', 'sub_cancelled']

  if (!type || !typesAllowed.includes(type)) {
    return NextResponse.json({ message: 'Type is required' }, { status: 400 })
  }

  console.log('🔔 Webhook received')
  console.log('🔔 Email:', email)
  console.log('🔔 Gateway:', gateway)
  console.log('🔔 Type:', type)
  console.log('🔔 Plan:', plan)
  console.log('🔔 Payment Value:', payment_value)

  const accessToken = await getAccessToken(
    process.env.KINDE_M2M_CLIENT_ID || '',
    process.env.KINDE_M2M_CLIENT_SECRET || ''
  )

  console.log('🔔 Access Token:', accessToken?.substring(0, 30))

  if (!accessToken) {
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }

  // fetch if users exists

  const searchedUser = await fetch(
    `${process.env.KINDE_ISSUER_URL}/api/v1/users?email=${email}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  console.log('🔔 Searched User Status:', searchedUser.status)
  const user = await searchedUser.json()

  let userFound = user?.users?.[0]

  if (!userFound) {
    console.log('🔔 User not found, creating...')
    const createdUser = await addUser(
      {
        email,
        name,
      },
      accessToken
    )

    console.log('🔔 Created User:', createdUser)
    userFound = createdUser
  } else {
    console.log('🔔 User found:', userFound)
  }

  const searchedUserProperties = await fetch(
    `${process.env.KINDE_ISSUER_URL}/api/v1/users/${userFound.id}/properties`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  console.log(
    '🔔 Searched User Properties Status:',
    searchedUserProperties.status
  )

  const userProperties = await searchedUserProperties.json()
  const foundProperties = userProperties.properties

  const allow_access_prop = foundProperties.find(
    (property: any) => property.key === 'allow_access'
  )

  const createdEvent = await prisma.subscriptionEvents.create({
    data: {
      kinde_id: userFound.id,
      event_type: type,
      name,
      email,
      gateway,
      plan,
      payment_value,
    },
  })

  console.log('🔔 Event created:', createdEvent)
  console.log('🔔 Allow access prop:', allow_access_prop)

  if (type === 'sub_confirmed') {
    const updated = await updateUserProps(
      userFound.id,
      {
        allow_access: true,
      },
      accessToken
    )

    console.log('👤 Subscription access updated:', updated.status)
    return NextResponse.json(
      { message: 'Subscription access updated' },
      { status: 200 }
    )
  }

  if (type === 'sub_cancelled') {
    const updated = await updateUserProps(
      userFound.id,
      {
        allow_access: 'false',
      },
      accessToken
    )

    console.log('👤 Subscription access updated:', updated.status)

    return NextResponse.json(
      { message: 'Subscription access updated' },
      { status: 200 }
    )
  }

  return NextResponse.json({ message: 'Webhook received' }, { status: 200 })
}
