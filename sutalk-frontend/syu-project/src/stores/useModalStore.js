import { create } from "zustand";

export const useModalStore = create((set) => ({
    // === 상태 ===
    isProfileOpen: false,
    profileSellerId: null,

    // === 액션 ===
    openProfile: (sellerId) =>
        set({ isProfileOpen: true, profileSellerId: sellerId }),
    closeProfile: () => set({ isProfileOpen: false, profileSellerId: null }),
}));
