import { useState } from 'react';

type StatusType = 'unread' | 'in_progress' | 'done';

interface StatusBadgeProps {
    status: StatusType | undefined;
    size?: 'sm' | 'md';
    onClick?: () => void;
}

const statusConfig: Record<StatusType, { label: string; color: string; bgColor: string; icon: string }> = {
    unread: {
        label: '未対応',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: '○'
    },
    in_progress: {
        label: '対応中',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        icon: '◐'
    },
    done: {
        label: '対応済',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: '●'
    }
};

export function StatusBadge({ status = 'unread', size = 'md', onClick }: StatusBadgeProps) {
    const config = statusConfig[status] || statusConfig.unread;

    const sizeClasses = size === 'sm'
        ? 'text-xs px-1.5 py-0.5'
        : 'text-sm px-2 py-1';

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bgColor} ${config.color} ${sizeClasses} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={onClick}
        >
            <span>{config.icon}</span>
            <span>{config.label}</span>
        </span>
    );
}

interface StatusSelectorProps {
    currentStatus: StatusType | undefined;
    onChange: (status: StatusType) => void;
}

export function StatusSelector({ currentStatus = 'unread', onChange }: StatusSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const statuses: StatusType[] = ['unread', 'in_progress', 'done'];

    return (
        <div className="relative">
            <StatusBadge
                status={currentStatus}
                onClick={() => setIsOpen(!isOpen)}
            />

            {isOpen && (
                <div className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px]">
                    {statuses.map((status) => (
                        <button
                            key={status}
                            className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 ${status === currentStatus ? 'bg-gray-50' : ''}`}
                            onClick={() => {
                                onChange(status);
                                setIsOpen(false);
                            }}
                        >
                            <StatusBadge status={status} size="sm" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export function getStatusLabel(status: StatusType | undefined): string {
    if (!status) return '未対応';
    return statusConfig[status]?.label || '未対応';
}
