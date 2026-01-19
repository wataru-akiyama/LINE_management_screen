import type { NextAction } from '../../types';

interface NextActionsProps {
    actions: NextAction[];
}

const PriorityBadge = ({ priority }: { priority: NextAction['priority'] }) => {
    const colors = {
        high: 'bg-red-100 text-red-700 border-red-200',
        medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        low: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    const labels = {
        high: '高',
        medium: '中',
        low: '低',
    };

    return (
        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${colors[priority]}`}>
            {labels[priority]}
        </span>
    );
};

const ActionTypeIcon = ({ type }: { type: NextAction['type'] }) => {
    const iconClass = "w-5 h-5";

    switch (type) {
        case 'follow_up':
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            );
        case 'upsell':
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            );
        case 'reminder':
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            );
        case 'check_in':
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        default:
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
    }
};

const getActionTypeColor = (type: NextAction['type']): string => {
    switch (type) {
        case 'follow_up': return 'bg-blue-50 text-blue-600';
        case 'upsell': return 'bg-green-50 text-green-600';
        case 'reminder': return 'bg-amber-50 text-amber-600';
        case 'check_in': return 'bg-purple-50 text-purple-600';
        default: return 'bg-gray-50 text-gray-600';
    }
};

export function NextActionsDisplay({ actions }: NextActionsProps) {
    if (actions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                推奨アクションはありません
            </div>
        );
    }

    // 優先度順にソート
    const sortedActions = [...actions].sort((a, b) => {
        const priority = { high: 0, medium: 1, low: 2 };
        return priority[a.priority] - priority[b.priority];
    });

    return (
        <div className="space-y-3">
            {sortedActions.map((action) => (
                <div
                    key={action.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                    <div className="flex items-start gap-3">
                        {/* アイコン */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getActionTypeColor(action.type)}`}>
                            <ActionTypeIcon type={action.type} />
                        </div>

                        {/* コンテンツ */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium text-gray-900">
                                    {action.title}
                                </h4>
                                <PriorityBadge priority={action.priority} />
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                                {action.description}
                            </p>
                            <p className="text-xs text-gray-400">
                                💡 {action.reason}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
