import { create } from 'zustand';
import { dataService } from '../services/dataService';

const KEY = 'swaya_notifications_read';
const readIds = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};
const writeIds = ids => localStorage.setItem(KEY, JSON.stringify(ids));

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  loaded: false,
  load: async () => {
    const read = new Set(readIds());
    const notifications = (await dataService.getNotifications()).map(item => ({ ...item, unread: item.unread && !read.has(item.id) }));
    set({ notifications, loaded: true });
  },
  markAllAsRead: () => {
    const ids = get().notifications.map(item => item.id);
    writeIds(ids);
    set({ notifications: get().notifications.map(item => ({ ...item, unread: false })) });
  },
  markAsRead: id => {
    const ids = Array.from(new Set([...readIds(), id]));
    writeIds(ids);
    set({ notifications: get().notifications.map(item => item.id === id ? { ...item, unread: false } : item) });
  },
  unreadCount: () => get().notifications.filter(item => item.unread).length,
}));
