import { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { DeliveryForm } from '../components/delivery/DeliveryForm';
import { DeliveryHistory } from '../components/delivery/DeliveryHistory';
import { StepDeliveryConfigList } from '../components/delivery/StepDeliveryConfig';
import { getDeliveryLogs, broadcastMessage, segmentDelivery, scheduleDelivery } from '../api/delivery';
import { useStore } from '../store/useStore';
import type { DeliveryLog, DeliveryType, DeliveryFilter } from '../types';

type TabType = 'create' | 'history' | 'step';

const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const HistoryIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const StepIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

export function Delivery() {
    const { addNotification } = useStore();
    const [activeTab, setActiveTab] = useState<TabType>('create');
    const [logs, setLogs] = useState<DeliveryLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (activeTab === 'history') {
            fetchLogs();
        }
    }, [activeTab]);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const data = await getDeliveryLogs();
            setLogs(data);
        } catch (error) {
            console.error('配信履歴取得エラー:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (data: {
        type: DeliveryType;
        filter: DeliveryFilter | null;
        content: string;
        scheduledAt?: string;
    }) => {
        setIsSubmitting(true);
        try {
            let result;

            if (data.scheduledAt) {
                result = await scheduleDelivery(data.filter, data.content, data.scheduledAt);
            } else if (data.type === 'broadcast') {
                result = await broadcastMessage(data.content);
            } else {
                result = await segmentDelivery(data.filter || {}, data.content);
            }

            if (result.success) {
                addNotification(
                    data.scheduledAt
                        ? '配信を予約しました'
                        : `${result.data?.targetCount || 0}人にメッセージを配信しました`,
                    'success'
                );
                // 履歴タブに切り替え
                setActiveTab('history');
                fetchLogs();
            } else {
                addNotification('配信に失敗しました', 'error');
            }
        } catch (error) {
            console.error('配信エラー:', error);
            addNotification('エラーが発生しました', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const tabs = [
        { id: 'create' as TabType, label: '新規配信', icon: <PlusIcon /> },
        { id: 'history' as TabType, label: '配信履歴', icon: <HistoryIcon /> },
        { id: 'step' as TabType, label: 'ステップ配信', icon: <StepIcon /> },
    ];

    return (
        <div className="min-h-screen">
            <Header title="配信管理" subtitle="メッセージの配信と履歴管理" />

            <div className="p-6">
                {/* タブ */}
                <div className="flex gap-2 mb-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.id
                                ? 'bg-primary-500 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50 card-shadow'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* コンテンツ */}
                {activeTab === 'create' && (
                    <DeliveryForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                )}

                {activeTab === 'history' && (
                    <DeliveryHistory logs={logs} isLoading={isLoading} />
                )}

                {activeTab === 'step' && (
                    <StepDeliveryConfigList />
                )}
            </div>
        </div>
    );
}
