import { mockRepository } from '../repositories/mock/mockRepository';
const KEY = 'swaya_user';
export const authService = {
  async login(email, password, role){ const user = await mockRepository.login(email,password,role); if(user){ localStorage.setItem(KEY, JSON.stringify(user)); } return user; },
  logout(){ localStorage.removeItem(KEY); },
  getCurrentUser(){ try{return JSON.parse(localStorage.getItem(KEY));}catch{return null;} },
  getRedirectPath(role){ return role==='teacher'?'/teacher/dashboard': role==='doctor'?'/doctor/dashboard':'/parent/dashboard'; }
};
