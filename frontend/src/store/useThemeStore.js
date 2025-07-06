import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("Chattr-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("Chattr-theme", theme);
    set({ theme });
  },
}));
