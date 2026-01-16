import { NavLink } from 'react-router-dom';
import { useStore } from '../../store/useStore';

// アイコンコンポーネント
const DashboardIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

const UsersIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const DeliveryIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const TemplateIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const SettingsIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const ChevronLeftIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

const ChatIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { path: '/', label: 'ダッシュボード', icon: <DashboardIcon /> },
    { path: '/users', label: 'ユーザー管理', icon: <UsersIcon /> },
    { path: '/chat', label: 'チャット', icon: <ChatIcon /> },
    { path: '/delivery', label: '配信管理', icon: <DeliveryIcon /> },
    { path: '/templates', label: 'テンプレート', icon: <TemplateIcon /> },
    { path: '/settings', label: '設定', icon: <SettingsIcon /> },
];

export function Sidebar() {
    const { sidebarOpen, toggleSidebar, totalUnreadCount } = useStore();

    return (
        <aside
            className={`fixed left-0 top-0 z-40 h-screen bg-primary-500 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'
                }`}
        >
            {/* ロゴ */}
            <div className="flex h-16 items-center justify-between border-b border-primary-400 px-4">
                {sidebarOpen && (
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500 font-bold text-white">
                            M
                        </div>
                        <span className="text-lg font-bold">MOISH</span>
                    </div>
                )}
                <button
                    onClick={toggleSidebar}
                    className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-primary-400 transition-colors"
                >
                    {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </button>
            </div>

            {/* ナビゲーション */}
            <nav className="mt-4 px-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-3 py-3 mb-1 transition-colors ${isActive
                                ? 'bg-accent-500 text-white'
                                : 'text-primary-100 hover:bg-primary-400 hover:text-white'
                            }`
                        }
                    >
                        <div className="relative">
                            {item.icon}
                            {!sidebarOpen && item.path === '/chat' && totalUnreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-primary-500" />
                            )}
                        </div>
                        {sidebarOpen && (
                            <>
                                <span className="font-medium flex-1">{item.label}</span>
                                {item.path === '/chat' && totalUnreadCount > 0 && (
                                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                                        {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                                    </span>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* フッター */}
            {sidebarOpen && (
                <div className="absolute bottom-4 left-4 right-4">
                    <div className="rounded-lg bg-primary-400 p-3">
                        <p className="text-xs text-primary-100">LINE管理画面</p>
                        <p className="text-sm font-medium">v1.0.0</p>
                    </div>
                </div>
            )}
        </aside>
    );
}
