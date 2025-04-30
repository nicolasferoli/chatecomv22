'use server'

import { prisma } from '@/lib/prisma'
import { Chat, Message } from '@prisma/client'
import { unstable_cache } from 'next/cache'

const REVALIDATION_INTERVAL = 60 * 15 // 15 minutos

export async function getChat(chatId: string) {
  const getCachedChat = unstable_cache(
    async (chatId: string): Promise<Chat | null> => {
      return await prisma.chat.findUnique({ where: { id: chatId } })
    },
    [chatId],
    { revalidate: REVALIDATION_INTERVAL, tags: [chatId] }
  )

  return getCachedChat(chatId)
}

export async function getMessages(chatId: string): Promise<Message[]> {
  const getCachedMessages = unstable_cache(
    (chatId: string) =>
      prisma.message.findMany({
        where: { chatId },
        orderBy: { position: 'asc' },
        select: {
          id: true,
          type: true,
          content: true,
          from: true,
          chatId: true,
          variableId: true,
          createdAt: true,
          updatedAt: true,
          variable: true,
        },
      }) as any,
    [chatId],
    { revalidate: REVALIDATION_INTERVAL, tags: [chatId] }
  )

  return getCachedMessages(chatId)
}
