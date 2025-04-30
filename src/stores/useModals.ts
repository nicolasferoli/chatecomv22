import { create } from 'zustand'
import { MessageType } from '@/types'

interface ModalsStore {
  // Modais de mensagem
  activeMessageModal: MessageType | null
  openMessageModal: (type: MessageType) => void
  closeMessageModal: () => void

  // Outros modais existentes...
  isDeletingContact: any | undefined
  isDeletingTrigger: any | undefined
  isDeletingAutomation: any | undefined
  isDeletingInstance: any | undefined
  isDisconnectingInstance: any | undefined
  isImportingSheetContacts: any | undefined
  isDeletingFolder: any | undefined
  isDeletingBroadcast: any | undefined
  isDeletingQuickResponse: any | undefined
  isSidebarOpen: boolean
  setSidebarOpen: (state: boolean) => void
  toggleSidebar: () => void
  setDeletingContact: (contact: any) => void
  setDeletingTrigger: (trigger: any) => void
  setDeletingAutomation: (automation: any) => void
  setDeletingInstance: (instance: any) => void
  setDisconnectingInstance: (instance: any) => void
  setImportingSheetContacts: (instance: any) => void
  setDeletingFolder: (folder: any) => void
  setDeletingBroadcast: (broadcast: any) => void
  setDeletingQuickResponse: (quickResponse: any) => void
}

export const useModals = create<ModalsStore>((set) => ({
  // Gerenciamento de modais de mensagem
  activeMessageModal: null,
  openMessageModal: (type: MessageType) => set({ activeMessageModal: type }),
  closeMessageModal: () => set({ activeMessageModal: null }),

  // Manter o resto do código existente...
  isDeletingContact: undefined,
  isDeletingTrigger: undefined,
  isDeletingAutomation: undefined,
  isDeletingInstance: undefined,
  isDisconnectingInstance: undefined,
  isImportingSheetContacts: undefined,
  isDeletingFolder: undefined,
  isDeletingBroadcast: undefined,
  isDeletingQuickResponse: undefined,
  isSidebarOpen: false,
  setSidebarOpen: (state) => set({ isSidebarOpen: state }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setDeletingTrigger: (trigger: any) => {
    set({ isDeletingTrigger: trigger })
  },
  setDeletingContact: (contact: any) => {
    set({ isDeletingContact: contact })
  },
  setDeletingAutomation: (automation: any) => {
    set({ isDeletingAutomation: automation })
  },
  setDeletingInstance: (instance: any) => {
    set({ isDeletingInstance: instance })
  },
  setDisconnectingInstance: (instance: any) => {
    set({ isDisconnectingInstance: instance })
  },
  setImportingSheetContacts: (instance: any) => {
    set({ isImportingSheetContacts: instance })
  },
  setDeletingFolder: (folder: any) => {
    set({ isDeletingFolder: folder })
  },
  setDeletingBroadcast: (broadcast: any) => {
    set({ isDeletingBroadcast: broadcast })
  },
  setDeletingQuickResponse: (quickResponse: any) => {
    set({ isDeletingQuickResponse: quickResponse })
  },
}))
