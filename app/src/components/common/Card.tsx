interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
    onClick?: () => void;
}

export function Card({ children, className = '', padding = 'md', hover = false, onClick }: CardProps) {
    const paddingStyles = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div
            className={`bg-white rounded-xl card-shadow ${paddingStyles[padding]} ${hover ? 'hover:card-shadow-lg transition-shadow cursor-pointer' : ''
                } ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

// 統計カード
interface StatCardProps {
    title: string;
    value: number | string;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'primary' | 'accent' | 'basic' | 'gray';
}

export function StatCard({ title, value, icon, trend, color = 'primary' }: StatCardProps) {
    const colorStyles = {
        primary: 'bg-primary-500',
        accent: 'bg-accent-500',
        basic: 'bg-basic-500',
        gray: 'bg-gray-500',
    };

    return (
        <Card className="relative overflow-hidden">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <p className={`mt-1 text-sm ${trend.isPositive ? 'text-accent-500' : 'text-red-500'}`}>
                            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </p>
                    )}
                </div>
                {icon && (
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorStyles[color]} text-white`}>
                        {icon}
                    </div>
                )}
            </div>
            <div className={`absolute bottom-0 left-0 h-1 w-full ${colorStyles[color]}`} />
        </Card>
    );
}
