import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import { MessageFromEnum } from '@prisma/client'

export const maxDuration = 300

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const id = uuidv4()

    const response = await axios.post(process.env.AI_URL + '/execute', body, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 500000,
    })

    if (response.status !== 200) {
      throw new Error('Error from AI service')
    }

    const data = response.data

    console.log({ data, body })

    await prisma.chat.create({
      data: {
        id: id,
        name: body.NAME,
        template: body.TEMPLATE,
        user_id: body.user_id,
        bot_name: 'Assistente',
        theme: 'whatsapp',
        prompt: {},
        type: 'ai',
        status: 'online',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    const typedData = data as Record<string, string>

    for (const i of Object.keys(typedData)) {
      if (data[i].type === 'audio') {
        console.log('INSERINDO AUDIO ==>')
        await prisma.message.create({
          data: {
            id: uuidv4(),
            chatId: id,
            content: {
              url: data[i].url,
            },
            type: 'audio',
            from: 'bot',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
      } else if (data[i].type === 'text' && data[i].text) {
        console.log('INSERINDO TEXTO ==>')
        await prisma.message.create({
          data: {
            id: uuidv4(),
            chatId: id,
            content: {
              text: data[i].text,
            },
            type: 'text',
            from: 'bot',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
      } else if (data[i].type === 'question') {
        console.log('INSERINDO PREGUNTA ==>')
        await prisma.message.create({
          data: {
            id: uuidv4(),
            chatId: id,
            content: {
              text: data[i].text,
              options: {
                type: 'text',
                variable: data[i].variable,
              },
            },
            type: 'question',
            from: 'bot',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
      } else if (data[i].type === 'section') {
        console.log('INSERINDO SECAO ==>', data[i])
        const respone = await prisma.message.create({
          data: {
            id: uuidv4(),
            chatId: id,
            content: {
              text: data[i].text,
            },
            type: 'section',
            from: MessageFromEnum.bot,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
        console.log(' SECAO INSERIDA <==', response)
      } else if (data[i].type === 'redirect') {
        console.log('INSERINDO REDIRECT ==>')

        await prisma.message.create({
          data: {
            id: uuidv4(),
            chatId: id,
            content: {
              url: data[i].text,
              redirectBlank: false,
            },
            type: 'redirect',
            from: 'bot',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
      }
    }

    return NextResponse.json({ id: id })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
