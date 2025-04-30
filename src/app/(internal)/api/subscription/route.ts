import { NextResponse } from 'next/server'
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

if (!process.env.STRIPE_MONTHLY_PRICE_ID) {
  throw new Error('STRIPE_MONTHLY_PRICE_ID is not set')
}

import { prisma } from '@/lib/prisma'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function GET(request: Request) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await prisma.profile.findFirst({
    where: {
      kinde_id: user.id,
    },
  })

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Se o usuário não tiver um customerId no Stripe, pesquisar ou criar um.
  let customerId = dbUser.stripe_id
  if (!customerId) {
    let searchedCustomer = await stripe.customers.list({
      email: user.email!,
      limit: 1,
    })

    if (searchedCustomer.data.length === 0) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: user.given_name + ' ' + user.last_name,
      })
      customerId = customer.id
    } else {
      customerId = searchedCustomer.data[0].id
    }

    // Atualizar o usuário no banco de dados com o customerId do Stripe.
    await prisma.profile.update({
      where: {
        kinde_id: user.id,
      },
      data: {
        stripe_id: customerId,
      },
    })
  }

  // Decidir qual Price ID usar (pode vir da requisição ou do .env)
  const usePriceId = process.env.STRIPE_MONTHLY_PRICE_ID

  if (!usePriceId) {
    return NextResponse.json(
      { error: 'Stripe Price ID not configured.' },
      { status: 500 }
    )
  }

  try {
    const checkout = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto'],
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: usePriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.KINDE_SITE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.KINDE_SITE_URL}/dashboard`,
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
    })

    return NextResponse.json({ url: checkout.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await prisma.profile.findFirst({
    where: {
      kinde_id: user.id,
    },
  })

  if (!dbUser || !dbUser.stripe_id) {
    let searchedCustomer = await stripe.customers.list({
      email: user.email!,
      limit: 1,
    })

    if (searchedCustomer.data.length === 0) {
      await stripe.customers.create({
        email: user.email!,
        name: user.given_name + ' ' + user.last_name,
      })
    } else {
      dbUser!.stripe_id = searchedCustomer.data[0].id
    }

    await prisma.profile.update({
      where: {
        kinde_id: user.id,
      },
      data: {
        stripe_id: dbUser!.stripe_id,
      },
    })
  }

  const portalUrl = await stripe.billingPortal.sessions.create({
    customer: dbUser!.stripe_id!,
    return_url: `${process.env.KINDE_SITE_URL}/dashboard`,
  })

  const subscription = await stripe.subscriptions.list({
    customer: dbUser!.stripe_id!,
    limit: 1,
    expand: ['data.default_payment_method', 'data.customer.invoice_settings'],
  })

  const payments = await stripe.paymentIntents.list({
    customer: dbUser!.stripe_id!,
    limit: 5, // Lista os últimos 5 pagamentos
  })

  return NextResponse.json({
    portalUrl: portalUrl.url,
    subscription: subscription.data[0] || null,
    payments: payments.data,
  })
}
