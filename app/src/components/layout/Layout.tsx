import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useStore } from '../../store/useStore';
import { getUnreadTotal } from '../../api/messages';

// 通知トースト
function NotificationToast() {
    const { notifications, removeNotification } = useStore();

    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-20 md:bottom-4 right-4 z-50 flex flex-col gap-2">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`animate-slide-in flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg ${notification.type === 'success'
                        ? 'bg-accent-500 text-white'
                        : notification.type === 'error'
                            ? 'bg-red-500 text-white'
                            : 'bg-primary-500 text-white'
                        }`}
                >
                    <span>{notification.message}</span>
                    <button
                        onClick={() => removeNotification(notification.id)}
                        className="ml-2 text-white/80 hover:text-white"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}

export function Layout() {
    const { sidebarOpen, setTotalUnreadCount } = useStore();
    const location = useLocation();

    // 未読総数の取得
    useEffect(() => {
        const fetchUnread = async () => {
            const count = await getUnreadTotal();
            setTotalUnreadCount(count);
        };

        // 初回ロード
        fetchUnread();

        // 定期ポーリング（30秒ごと）
        const interval = setInterval(fetchUnread, 30000);

        return () => clearInterval(interval);
    }, [location.pathname]); // ページ遷移時にも再取得

    return (
        <div className="min-h-screen bg-gray-50">
            {/* PC: サイドバー */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* メインコンテンツ */}
            <main
                className={`transition-all duration-300 pb-16 md:pb-0 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}
            >
                <Outlet />
            </main>

            {/* スマホ: ボトムナビ */}
            <BottomNav />

            <NotificationToast />
        </div>
    );
}
