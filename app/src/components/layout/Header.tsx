import { useStore } from '../../store/useStore';

interface HeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

const MenuIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const BellIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

export function Header({ title, subtitle, actions }: HeaderProps) {
    const { sidebarOpen, toggleSidebar, notifications } = useStore();

    return (
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
                <div className="flex items-center gap-4">
                    {/* モバイルメニューボタン */}
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        <MenuIcon />
                    </button>

                    {/* タイトル */}
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                        {subtitle && (
                            <p className="text-sm text-gray-500">{subtitle}</p>
                        )}
                    </div>
                </div>

                {/* アクション */}
                <div className="flex items-center gap-4">
                    {actions}

                    {/* 通知ベル */}
                    <button className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                        <BellIcon />
                        {notifications.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                                {notifications.length}
                            </span>
                        )}
                    </button>

                    {/* ユーザーアバター */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium text-gray-900">管理者</p>
                            <p className="text-xs text-gray-500">admin@moish.jp</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white font-medium">
                            A
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
