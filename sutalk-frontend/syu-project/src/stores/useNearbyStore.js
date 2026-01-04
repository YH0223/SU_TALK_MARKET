import { create } from "zustand";

export const useNearbyStore = create((set) => ({
    users: {},

    updateUser: (user) =>
        set((state) => ({
            users: { ...state.users, [user.userId]: user },
        })),

    clearAll: () => set({ users: {} }),
}));