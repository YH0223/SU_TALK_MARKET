import { create } from "zustand"

export const useChatStore = create((set, get) => ({
  // State
  chats: [],
  currentChatRoom: null,
  messages: [],
  loading: false,
  error: null,

  // Actions
  setChats: (chats) => set({ chats }),

  setCurrentChatRoom: (chatRoom) => set({ currentChatRoom: chatRoom }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  clearCurrentChat: () =>
    set({
      currentChatRoom: null,
      messages: [],
    }),

  // Computed
  getChatById: (chatId) => {
    const { chats } = get()
    return chats.find((chat) => chat.id === chatId)
  },
}))
