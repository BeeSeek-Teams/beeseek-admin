import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { disconnectSocket } from '@/lib/socket';

export type UserRole = 'CLIENT' | 'AGENT' | 'SUPPORT' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setAuth: (user, accessToken) => {
        Cookies.set('accessToken', accessToken, {
          expires: 7,
          secure: window.location.protocol === 'https:',
          sameSite: 'strict',
        });
        set({ user, accessToken });
      },
      logout: () => {
        disconnectSocket();
        Cookies.remove('accessToken');
        Cookies.remove('queen_session');
        Cookies.remove('queen_key');
        set({ user: null, accessToken: null });
      },
      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
    }),
    {
      name: 'beeseek-admin-auth',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
