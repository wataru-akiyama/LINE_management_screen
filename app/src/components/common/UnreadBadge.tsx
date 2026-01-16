interface UnreadBadgeProps {
    count: number;
    size?: 'sm' | 'md';
}

export function UnreadBadge({ count, size = 'md' }: UnreadBadgeProps) {
    if (count <= 0) return null;

    const sizeClasses = {
        sm: 'min-w-[18px] h-[18px] text-[10px]',
        md: 'min-w-[22px] h-[22px] text-xs',
    };

    return (
        <span
            className={`inline-flex items-center justify-center rounded-full bg-red-500 text-white font-bold px-1.5 ${sizeClasses[size]}`}
        >
            {count > 99 ? '99+' : count}
        </span>
    );
}
