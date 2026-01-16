import { create } from 'zustand';
import type { User, UserFilters } from '../types';

interface AppState {
    // サイドバー
    sidebarOpen: boolean;
    toggleSidebar: () => void;

    // 選択中のユーザー
    selectedUser: User | null;
    setSelectedUser: (user: User | null) => void;

    // ユーザーフィルター
    userFilters: UserFilters;
    setUserFilters: (filters: UserFilters) => void;

    // ユーザー詳細モーダル
    userDetailOpen: boolean;
    setUserDetailOpen: (open: boolean) => void;

    // 通知
    notifications: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
    addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
    removeNotification: (id: string) => void;

    // 未読総数
    totalUnreadCount: number;
    setTotalUnreadCount: (count: number) => void;
}

export const useStore = create<AppState>((set) => ({
    // サイドバー
    sidebarOpen: true,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    // 選択中のユーザー
    selectedUser: null,
    setSelectedUser: (user) => set({ selectedUser: user }),

    // ユーザーフィルター
    userFilters: {},
    setUserFilters: (filters) => set({ userFilters: filters }),

    // ユーザー詳細モーダル
    userDetailOpen: false,
    setUserDetailOpen: (open) => set({ userDetailOpen: open }),

    // 通知
    notifications: [],
    addNotification: (message, type) => {
        const id = Date.now().toString();
        set((state) => ({
            notifications: [...state.notifications, { id, message, type }],
        }));
        // 5秒後に自動で消す
        setTimeout(() => {
            set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id),
            }));
        }, 5000);
    },
    removeNotification: (id) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        })),

    // 未読総数
    totalUnreadCount: 0,
    setTotalUnreadCount: (count) => set({ totalUnreadCount: count }),
}));
