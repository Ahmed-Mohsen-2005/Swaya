import { create } from 'zustand';
import { authService } from '../services/authService';
export const useAuthStore = create((set) => ({
  user: authService.getCurrentUser(),
  login: async (email,password,role) => { const user = await authService.login(email,password,role); set({user}); return user; },
  quickLogin: async (role) => {
    const email = role === 'teacher' ? 'teacher@swaya.demo' : role === 'doctor' ? 'doctor@swaya.demo' : 'parent@swaya.demo';
    const user = await authService.login(email,'demo123',role); set({user}); return user;
  },
  logout: () => { authService.logout(); set({user:null}); }
}));
