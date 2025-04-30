'use server'

import { prisma } from '@/lib/prisma'
import { ChatAction } from '@prisma/client'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function sendAnswer(
  runId: string,
  chatId: string,
  messageId: string,

  answer: string
) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  })

  const variableName = (message?.content as any)?.options?.variable
  if (!variableName)
    return NextResponse.json(
      {
        error: 'Resposta inválida',
      },
      { status: 400 }
    )

  try {
    await prisma.variable.create({
      data: {
        name: variableName,
        value: answer,
        chatId,
        runId,
      },
    })
  } catch (error) {
    console.error('Error when creating variable: ', error)
  }
}

export async function registerChatAction(
  chatId: string,
  actionType: ChatAction,
  options?: {
    question_type?: string
    question_variable?: string
    question_answer?: string
    button_question?: string
    button_answer?: string
    clicked_link_url?: string
    flux_completed_value?: boolean
    question_text?: string
  }
) {
  const requestHeaders = await headers()

  const host = requestHeaders.get('host')
  const protocol = requestHeaders.get('x-forwarded-proto')

  await fetch(`${protocol}://${host}/api/chatlogs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ chatId, action: actionType, ...options }),
  })
}
