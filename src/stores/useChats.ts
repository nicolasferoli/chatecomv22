import { create } from 'zustand'
import { Chat, CreateChatRequest } from '@/types'

interface ChatsStore {
  chats: Chat[]
  loading: boolean
  error: string | null
  getChats: () => Promise<void>
  createChat: (
    data: CreateChatRequest & { id?: string }
  ) => Promise<Chat | null>
  updateChat: (id: string, data: Partial<CreateChatRequest>) => Promise<void>
  deleteChat: (id: string) => Promise<void>
  getChat: (id: string) => Promise<Chat | null>
}

export const useChats = create<ChatsStore>((set, get) => ({
  chats: [],
  loading: false,
  error: null,

  getChat: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/chat/${id}`)
      const data = await response.json()
      set((state) => ({
        chats: [...state.chats.filter((chat) => chat.id !== id), data],
      }))
      return data
    } catch (error) {
      set({ error: 'Erro ao carregar chat' })
      console.error('Error fetching chat:', error)
    } finally {
      set({ loading: false })
    }
  },

  getChats: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/chat')
      const data = await response.json()
      set({ chats: data })
    } catch (error) {
      set({ error: 'Erro ao carregar chats' })
      console.error('Error fetching chats:', error)
    } finally {
      set({ loading: false })
    }
  },

  createChat: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const chat = await response.json()
      set((state) => ({ chats: [...state.chats, chat] }))
      return chat
    } catch (error) {
      set({ error: 'Erro ao criar chat' })
      console.error('Error creating chat:', error)
      return null
    } finally {
      set({ loading: false })
    }
  },

  updateChat: async (id: string, data: Partial<CreateChatRequest>) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/chat/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const updatedChat = await response.json()
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === id ? { ...chat, ...updatedChat } : chat
        ),
      }))
    } catch (error) {
      set({ error: 'Erro ao atualizar chat' })
      console.error('Error updating chat:', error)
    } finally {
      set({ loading: false })
    }
  },

  deleteChat: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await fetch(`/api/chat/${id}`, { method: 'DELETE' })
      set((state) => ({
        chats: state.chats.filter((chat) => chat.id !== id),
      }))
    } catch (error) {
      set({ error: 'Erro ao deletar chat' })
      console.error('Error deleting chat:', error)
    } finally {
      set({ loading: false })
    }
  },
}))
