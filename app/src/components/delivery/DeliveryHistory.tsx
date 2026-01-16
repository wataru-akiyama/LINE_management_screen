import type { DeliveryLog } from '../../types';
import { Card } from '../common/Card';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

interface DeliveryHistoryProps {
    logs: DeliveryLog[];
    isLoading?: boolean;
}

const BroadcastIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
);

const SegmentIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

export function DeliveryHistory({ logs, isLoading }: DeliveryHistoryProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-200" />
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                    <BroadcastIcon />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">配信履歴がありません</h3>
                <p className="text-gray-500">まだメッセージを配信していません</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {logs.map((log) => (
                <Card key={log.deliveryId}>
                    <div className="flex items-start gap-4">
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${log.deliveryType === 'broadcast'
                                    ? 'bg-primary-100 text-primary-600'
                                    : 'bg-accent-100 text-accent-600'
                                }`}
                        >
                            {log.deliveryType === 'broadcast' ? <BroadcastIcon /> : <SegmentIcon />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">
                                    {log.deliveryType === 'broadcast' ? '全体配信' : 'セグメント配信'}
                                </span>
                                <StatusBadge status={log.status} />
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                                対象: {log.targetCount}人
                                {log.targetFilter && Object.keys(log.targetFilter).length > 0 && (
                                    <span className="ml-2 text-gray-400">
                                        ({Object.entries(log.targetFilter).map(([k, v]) => `${k}: ${v}`).join(', ')})
                                    </span>
                                )}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {log.status === 'pending' && log.scheduledAt
                                    ? `予定: ${format(parseISO(log.scheduledAt), 'yyyy年M月d日 HH:mm', { locale: ja })}`
                                    : log.sentAt
                                        ? `配信: ${format(parseISO(log.sentAt), 'yyyy年M月d日 HH:mm', { locale: ja })}`
                                        : `作成: ${format(parseISO(log.createdAt), 'yyyy年M月d日 HH:mm', { locale: ja })}`}
                            </p>
                        </div>
                    </div>
                    {/* メッセージプレビュー */}
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 line-clamp-2">
                            {typeof log.messageContent === 'object' && 'text' in log.messageContent
                                ? (log.messageContent as { text: string }).text
                                : JSON.stringify(log.messageContent)}
                        </p>
                    </div>
                </Card>
            ))}
        </div>
    );
}

function StatusBadge({ status }: { status: 'pending' | 'sent' | 'failed' }) {
    const styles = {
        pending: 'bg-yellow-100 text-yellow-700',
        sent: 'bg-green-100 text-green-700',
        failed: 'bg-red-100 text-red-700',
    };

    const labels = {
        pending: '予約中',
        sent: '配信済',
        failed: '失敗',
    };

    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}
