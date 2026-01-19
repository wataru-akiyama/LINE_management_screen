import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { UserActivity } from '../../types';

interface ActivityTimelineProps {
    activities: UserActivity[];
    maxItems?: number;
}

const ActivityIcon = ({ type }: { type: UserActivity['type'] }) => {
    const iconClass = "w-4 h-4";

    switch (type) {
        case 'login':
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
            );
        case 'message_sent':
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            );
        case 'message_received':
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            );
        case 'diagnosis':
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        case 'survey':
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            );
        case 'page_view':
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            );
        case 'rich_menu':
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
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

const getActivityColor = (type: UserActivity['type']): string => {
    switch (type) {
        case 'login': return 'bg-blue-100 text-blue-600';
        case 'message_sent': return 'bg-green-100 text-green-600';
        case 'message_received': return 'bg-purple-100 text-purple-600';
        case 'diagnosis': return 'bg-yellow-100 text-yellow-600';
        case 'survey': return 'bg-pink-100 text-pink-600';
        case 'page_view': return 'bg-gray-100 text-gray-600';
        case 'rich_menu': return 'bg-indigo-100 text-indigo-600';
        default: return 'bg-gray-100 text-gray-600';
    }
};

const formatRelativeDate = (dateStr: string): string => {
    const date = parseISO(dateStr);
    if (isToday(date)) {
        return `今日 ${format(date, 'HH:mm', { locale: ja })}`;
    }
    if (isYesterday(date)) {
        return `昨日 ${format(date, 'HH:mm', { locale: ja })}`;
    }
    return format(date, 'M月d日 HH:mm', { locale: ja });
};

export function ActivityTimeline({ activities, maxItems = 10 }: ActivityTimelineProps) {
    const displayActivities = activities.slice(0, maxItems);

    if (displayActivities.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                活動履歴がありません
            </div>
        );
    }

    return (
        <div className="flow-root">
            <ul className="-mb-8">
                {displayActivities.map((activity, index) => (
                    <li key={activity.id}>
                        <div className="relative pb-8">
                            {/* 縦線 */}
                            {index !== displayActivities.length - 1 && (
                                <span
                                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                                    aria-hidden="true"
                                />
                            )}

                            <div className="relative flex items-start space-x-3">
                                {/* アイコン */}
                                <div className={`relative flex h-8 w-8 items-center justify-center rounded-full ${getActivityColor(activity.type)}`}>
                                    <ActivityIcon type={activity.type} />
                                </div>

                                {/* コンテンツ */}
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm">
                                        <span className="font-medium text-gray-900">
                                            {activity.description}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        {formatRelativeDate(activity.timestamp)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
