import { create } from 'zustand'
import {
  Message,
  UpdateMessageRequest,
  CreateMessageRequest,
  MessageType,
  SectionMessageType,
} from '@/types'
import { toast, Id } from 'react-toastify'
import { revalidateTag } from 'next/cache'

interface MessagesState {
  messages: Record<string, Message[]>
  loading: boolean
  error: string | null
  getMessages: (chatId: string) => Promise<Message[]>
  createMessage: (data: CreateMessageRequest) => Promise<Message | null>
  editingMessageId: string | null
  editMessage: (
    id: string,
    data: UpdateMessageRequest
  ) => Promise<Message | null>
  startEditing: (chatId: string, messageId: string) => void
  stopEditing: (chatId: string, messageId: string) => void
  clearMessages: () => void
  createEditingMessage: {
    chatId: string
    type: MessageType
    content: Record<string, any> // Added missing 'content' property
  } | null
  startCreatingMessage: (chatId: string, type: MessageType) => void
  stopCreatingMessage: (chatId: string) => void
  setEditingMessageId: (messageId: string) => void
  updateMessages: (chatId: string, messages: Message[]) => void
  setMessages: (chatId: string, messages: Message[]) => void
  toggleSection: (chatId: string, sectionId: string) => void
  deleteMessage: (chatId: string, messageId: string) => void
  checkIfMessageIsHidden: (chatId: string, messageId: string) => boolean
  checkIfMessageIsInsideSection: (chatId: string, messageId: string) => boolean
  moveMessage: (chatId: string, messageId: string, newIndex: number) => void
}

export const useMessages = create<MessagesState>((set, get) => ({
  messages: {},
  loading: false,
  error: null,
  editingMessageId: null,
  createEditingMessage: null,
  toggleSection: (chatId: string, sectionId: string) => {
    const isClosed = (
      get().messages[chatId].find(
        (msg) => msg.id === sectionId
      ) as SectionMessageType
    )?.content.isClosed
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: state.messages[chatId].map((msg) => {
          if (msg.id === sectionId && msg.type === 'section') {
            return {
              ...msg,
              content: {
                ...msg.content,
                isClosed: !isClosed,
              },
            }
          }
          return msg
        }),
      },
    }))
    const section = get().messages[chatId].find((msg) => msg.id === sectionId)
    if (section?.type === 'section') {
      get().editMessage(sectionId, {
        chatId,
        type: 'section',
        content: {
          text: section.content.text,
          isClosed: !isClosed,
        },
      })
    }
  },
  moveMessage: (chatId: string, messageId: string, newIndex: number) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: state.messages[chatId].map((msg) =>
          msg.id === messageId ? { ...msg, index: newIndex } : msg
        ),
      },
    }))
    const message = get().messages[chatId].find((msg) => msg.id === messageId)
    if (message) {
      get().editMessage(messageId, {
        chatId,
        type: message.type,
        content: message.content,
        index: newIndex,
      })
    }
  },
  setMessages: (chatId: string, messages: Message[]) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: messages,
      },
    }))
  },
  getMessages: async (chatId: string) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/chat/message?chatId=${chatId}`)
      const data = await response.json()

      const sortedMessages = data.sort(
        (a: any, b: any) => a.position - b.position
      )

      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: sortedMessages.map((msg) => ({ ...msg, isEditing: false })),
        },
      }))
      return sortedMessages
    } catch (error) {
      set({ error: 'Erro ao carregar mensagens' })
      return []
    } finally {
      set({ loading: false })
    }
  },

  createMessage: async (data: CreateMessageRequest) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const message = await response.json()
      if (message) {
        set((state) => ({
          messages: {
            ...state.messages,
            [data.chatId]: [
              ...(state.messages[data.chatId] || []),
              { ...message, isEditing: false },
            ],
          },
        }))
      }
      set({ createEditingMessage: null })
      return message
    } catch (error) {
      set({ error: 'Erro ao criar mensagem' })
      return null
    } finally {
      set({ loading: false })
      try {
        revalidateTag(data.chatId)
      } catch {}
    }
  },

  editMessage: async (messageId: string, data: UpdateMessageRequest) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/chat/message/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Erro ao editar a mensagem')
      }

      const updatedMessage = await response.json()
      if (updatedMessage) {
        set((state) => ({
          messages: {
            ...state.messages,
            [data.chatId]: state.messages[data.chatId],
          },
        }))
      }
      return updatedMessage
    } catch (error) {
      set({ error: 'Erro ao editar mensagem' })
      return null
    } finally {
      set({ loading: false })
      try {
        revalidateTag(data.chatId)
      } catch {}
    }
  },

  updateMessages: async (chatId: string, messages: Message[]) => {
    const toastId: Id = toast.info(
      'Estamos salvando suas mensagens, aguarde até finalizar!',
      {
        autoClose: false, // Keep the toast open until updated
      }
    )

    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: messages,
      },
    }))

    messages = messages.map((message, position) => ({
      ...message,
      position,
    }))

    const response = await fetch(`/api/chat/message/batch`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, messages }),
    })

    try {
      revalidateTag(chatId)
    } catch {}

    toast.update(toastId, {
      render: 'Mensagens salvas com sucesso!',
      type: 'success',
      autoClose: 3000,
    })

    const data = await response.json()
    return data
  },

  checkIfMessageIsInsideSection: (
    chatId: string,
    messageId: string
  ): boolean => {
    const state = get()
    const messageIndex = state.messages[chatId]?.findIndex(
      (msg) => msg.id === messageId
    )
    const sections = state.messages[chatId]?.filter(
      (msg) => msg.type === 'section'
    )
    if (!sections?.length) return false

    const sectionBeforeMessage = [...sections]
      .reverse()
      .find(
        (section) => state.messages[chatId]?.indexOf(section) < messageIndex
      )

    if (sectionBeforeMessage === sections[sections.length - 1]) return false

    return sectionBeforeMessage !== undefined
  },

  checkIfMessageIsHidden: (chatId: string, messageId: string) => {
    const state = get()
    const messageIndex = state.messages[chatId]?.findIndex(
      (msg) => msg.id === messageId
    )

    if (
      !state.messages[chatId]?.filter(
        (msg) =>
          msg.type === 'section' &&
          state.messages[chatId].indexOf(msg) < messageIndex
      ).length
    )
      return false

    const sections = state.messages[chatId]?.filter(
      (msg) => msg.type === 'section'
    )
    if (!sections?.length) return false

    const sectionBeforeMessage = [...sections]
      .reverse()
      .find(
        (section) => state.messages[chatId]?.indexOf(section) < messageIndex
      )

    if (!sectionBeforeMessage) return false
    return (sectionBeforeMessage as SectionMessageType).content.isClosed
  },
  deleteMessage: async (chatId: string, messageId: string) => {
    set({ loading: true, error: null })
    try {
      await fetch(`/api/chat/message/${messageId}`, { method: 'DELETE' })
      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: state.messages[chatId].filter(
            (msg) => msg.id !== messageId
          ),
        },
      }))
    } catch (error) {
      set({ error: 'Erro ao deletar mensagem' })
    } finally {
      set({ loading: false })
      try {
        revalidateTag(chatId)
      } catch {}
    }
  },

  startEditing: (chatId: string, messageId: string) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: state.messages[chatId].map((msg) =>
          msg.id === messageId ? { ...msg, isEditing: true } : msg
        ),
      },
    }))
  },

  stopEditing: (chatId: string, messageId: string) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: state.messages[chatId].map((msg) =>
          msg.id === messageId ? { ...msg, isEditing: false } : msg
        ),
      },
    }))
  },

  clearMessages: () => set({ messages: {} }),

  startCreatingMessage: (chatId: string, type: MessageType) => {
    set({ createEditingMessage: { chatId, type, content: {} } })
  },

  stopCreatingMessage: (chatId: string) => {
    set({ createEditingMessage: null })
  },

  setEditingMessageId: (messageId: string) => {
    set({ editingMessageId: messageId })
  },
}))
