import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
// import Stripe from 'stripe'

// if (!process.env.STRIPE_SECRET_KEY) {
//   throw new Error('STRIPE_SECRET_KEY is not set')
// }

// if (!process.env.STRIPE_MONTHLY_PRICE_ID) {
//   throw new Error('STRIPE_MONTHLY_PRICE_ID is not set')
// }

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2023-11-01', // Verifique a versão da API
//   typescript: true,
// })

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const chatId = searchParams.get('chatId')

  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Usuário não autenticado' },
      { status: 401 }
    )
  }

  console.log(`🟢 User ID: ${user.id}`)
  const { email, id: kinde_id } = user

  if (!email) {
    return NextResponse.json(
      { error: 'Email do usuário não encontrado' },
      { status: 401 }
    )
  }

  if (!kinde_id) {
    return NextResponse.json(
      { error: 'Usuário não autenticado' },
      { status: 401 }
    )
  }

  if (!chatId) {
    return NextResponse.json(
      { error: 'Chat ID não encontrado' },
      { status: 404 }
    )
  }

  try {
    // Precisamos calcular o total de respostas, total de views e total de fluxos completos

    const allChatLogs = await prisma.chatActionLog.findMany({
      where: {
        chatId: chatId,
      },
    })

    //  viewed
    //  answered_question
    //  flux_completed
    //  clicked_button
    //  clicked_link

    // total de respostas, vamos somar answered_question + clicked_button

    const total_answers = allChatLogs.filter(
      (log) =>
        log.action === 'answered_question' || log.action === 'clicked_button'
    ).length

    // total de views, vamos somar viewed

    const total_views = allChatLogs.filter(
      (log) => log.action === 'viewed'
    ).length

    // total de fluxos completos, vamos somar flux_completed

    const total_completed_fluxes = allChatLogs.filter(
      (log) => log.action === 'flux_completed'
    ).length

    // agora precisamos pegar todos os clicks de botão, agrupar por button_question e contabilizar em percentual as "button_answer"

    const button_clicks = allChatLogs.filter(
      (log) =>
        log.action === 'clicked_button' &&
        log.button_question &&
        log.button_answer
    )

    const answered_questions = allChatLogs.filter(
      (log) => log.action === 'answered_question'
    )

    //console.log('🟢 Answered Questions', answered_questions)

    // Agrupando respostas por "question_variable" e contabilizando as respostas "question_answer"

    const grouped_answered_questions = answered_questions.reduce((acc, log) => {
      const question = log.question_text as string
      const answer = log.question_answer as string

      if (!acc[question]) {
        acc[question] = { total: 0, answers: [] }
      }

      acc[question].total += 1
      acc[question].answers.push({
        text: answer,
        date: log.createdAt,
      })

      return acc
    }, {})

    // Agrupando cliques por "button_question" e contabilizando as respostas "button_answer"
    const grouped_results = button_clicks.reduce((acc, log) => {
      const question = log.button_question as string
      const answer = log.button_answer as string

      if (!acc[question]) {
        acc[question] = { total: 0, answers: {} }
      }

      acc[question].total += 1
      acc[question].answers[answer] = (acc[question].answers[answer] || 0) + 1

      return acc
    }, {})

    //console.log('🟢 Grouped Answered Questions', grouped_answered_questions)

    // Transformando os resultados agrupados em um array e calculando os percentuais
    const final_button_results = Object.entries(grouped_results).map(
      ([question, data]: [string, any]) => {
        const total = data.total
        const answers = Object.entries(data.answers).map(
          ([answer, count], index) => ({
            label: answer,
            count: count as number,
            percentage: parseFloat(
              (((count as number) / total) * 100).toFixed(2)
            ),
          })
        )

        return {
          question,
          answers,
        }
      }
    )

    // Agrupando respostas por "question_variable" e contabilizando as respostas "question_answer"
    const final_answered_questions = Object.entries(
      grouped_answered_questions
    ).map(([question, data]: [string, any]) => {
      return {
        question,
        answers: data?.answers,
      }
    })

    console.log('🟢 Final Results', final_answered_questions)

    return NextResponse.json({
      total_answers,
      total_views,
      total_completed_fluxes,
      questions: [...final_button_results, ...final_answered_questions],
    })
  } catch (error) {
    console.log('❌ -> Erro ao buscar chat logs:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar chat logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const {
      chatId,
      action,
      question_type,
      question_variable,
      question_answer,
      button_question,
      button_answer,
      clicked_link_url,
      question_text,
    } = await request.json()

    if (!chatId || !action) {
      return NextResponse.json(
        { error: 'Chat ID e ação são obrigatórios' },
        { status: 400 }
      )
    }

    const searchedChat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
    })

    console.log('🟢 Chat encontrado:', searchedChat)

    if (!searchedChat) {
      return NextResponse.json(
        { error: 'Chat não encontrado' },
        { status: 404 }
      )
    }

    const chatActionLog = await prisma.chatActionLog.create({
      data: {
        chatId,
        action,
        question_type,
        question_variable,
        question_answer,
        button_question,
        button_answer,
        clicked_link_url,
        question_text,
      },
    })

    console.log('🟢 Chat action log criado:', chatActionLog)

    const resPayload = {
      status: 'ok',
    }

    return NextResponse.json(resPayload)
  } catch (error) {
    console.log('❌ -> Erro ao criar chat:', error)
    return NextResponse.json({ error: 'Erro ao criar chat' }, { status: 500 })
  }
}
