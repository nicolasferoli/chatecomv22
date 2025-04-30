import { Chat, Message } from '@prisma/client'
import { createContext, Dispatch, SetStateAction, useContext } from 'react'

type ChatContextProps = {
  chatInfo: Chat
  isTyping: boolean
  isWaitingAnswer: boolean
  setWaitingAnswer: Dispatch<SetStateAction<boolean>>
  storeUserAnswer: (answer: string) => Promise<void>
  messages: Message[]
  currentMessage?: Message
}

export const ChatContext = createContext<ChatContextProps>(
  {} as ChatContextProps
)

export const useChatContext = () => useContext(ChatContext)
