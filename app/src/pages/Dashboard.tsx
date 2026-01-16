import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Card, StatCard } from '../components/common/Card';
import { PlanBadge } from '../components/common/PlanBadge';
import { getStatistics, getDeliveryLogs } from '../api/delivery';
import { getUsers } from '../api/users';
import { getMessageQuota, type MessageQuota } from '../api/quota';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Statistics, User, DeliveryLog } from '../types';

// アイコン
const UsersIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const StarIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const MessageIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const CalendarIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export function Dashboard() {
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [recentUsers, setRecentUsers] = useState<User[]>([]);
    const [pendingDeliveries, setPendingDeliveries] = useState<DeliveryLog[]>([]);
    const [quota, setQuota] = useState<MessageQuota | null>(null);

    useEffect(() => {
        // 統計情報取得
        getStatistics().then(setStatistics);

        // 最新ユーザーを取得（未読メッセージがあるユーザー優先）
        getUsers({ limit: 5 }).then(result => {
            setRecentUsers(result.users.filter(u => u.hasUnreadMessages).slice(0, 5));
        });

        // 予約配信を取得
        getDeliveryLogs().then(logs => {
            setPendingDeliveries(logs.filter((d) => d.status === 'pending'));
        });

        // メッセージ使用量を取得
        getMessageQuota().then(setQuota);
    }, []);

    return (
        <div className="min-h-screen">
            <Header title="ダッシュボード" subtitle="MOISH LINE管理画面へようこそ" />

            <div className="p-6">
                {/* 統計カード */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="総ユーザー数"
                        value={statistics?.totalUsers || 0}
                        icon={<UsersIcon />}
                        color="primary"
                    />
                    <StatCard
                        title="BASICプラン"
                        value={statistics?.basicUsers || 0}
                        icon={<StarIcon />}
                        color="basic"
                    />
                    <StatCard
                        title="FREEプラン"
                        value={statistics?.freeUsers || 0}
                        icon={<UsersIcon />}
                        color="gray"
                    />
                    <StatCard
                        title="診断完了"
                        value={statistics?.diagnosisCompleted || 0}
                        icon={<CheckIcon />}
                        color="accent"
                    />
                </div>

                {/* メッセージ使用量 */}
                {quota && (
                    <div className="mb-8">
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">今月のメッセージ配信</h2>
                                        <p className="text-sm text-gray-500">無料メッセージ使用状況</p>
                                    </div>
                                </div>
                                {quota.quotaType === 'unlimited' ? (
                                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                                        無制限プラン
                                    </span>
                                ) : (
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${quota.percentage >= 90
                                        ? 'bg-red-100 text-red-700'
                                        : quota.percentage >= 70
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-green-100 text-green-700'
                                        }`}>
                                        {quota.percentage}% 使用
                                    </span>
                                )}
                            </div>

                            {quota.quotaType === 'limited' && (
                                <>
                                    <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                                        <div
                                            className={`h-4 rounded-full transition-all ${quota.percentage >= 90
                                                ? 'bg-red-500'
                                                : quota.percentage >= 70
                                                    ? 'bg-yellow-500'
                                                    : 'bg-green-500'
                                                }`}
                                            style={{ width: `${Math.min(quota.percentage, 100)}%` }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{quota.used.toLocaleString()}</p>
                                            <p className="text-sm text-gray-500">使用済み</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-green-600">{quota.remaining.toLocaleString()}</p>
                                            <p className="text-sm text-gray-500">残り</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{quota.limit.toLocaleString()}</p>
                                            <p className="text-sm text-gray-500">上限</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {quota.quotaType === 'unlimited' && (
                                <div className="text-center py-4">
                                    <p className="text-2xl font-bold text-gray-900">{quota.used.toLocaleString()}</p>
                                    <p className="text-sm text-gray-500">今月の配信数</p>
                                </div>
                            )}
                        </Card>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 最新ユーザー */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">最新ユーザー</h2>
                            <Link
                                to="/users"
                                className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                            >
                                すべて見る →
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {recentUsers.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">ユーザーがいません</p>
                            ) : (
                                recentUsers.map((user) => (
                                    <Link
                                        key={user.userId}
                                        to={`/users/${user.userId}/chat`}
                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">{user.name}</span>
                                                <PlanBadge plan={user.plan} size="sm" />
                                                {user.hasUnreadMessages && (
                                                    <span className="flex h-2 w-2 rounded-full bg-red-500" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">{user.teamName}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {user.grade} / {user.region}
                                            </p>
                                        </div>
                                        <MessageIcon />
                                    </Link>
                                ))
                            )}
                        </div>
                    </Card>

                    {/* 予約配信 */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">予約配信</h2>
                            <Link
                                to="/delivery"
                                className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                            >
                                配信管理 →
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {pendingDeliveries.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">予約配信はありません</p>
                            ) : (
                                pendingDeliveries.map((delivery) => (
                                    <div
                                        key={delivery.deliveryId}
                                        className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                                    >
                                        <div className="flex-shrink-0">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-100 text-accent-600">
                                                <CalendarIcon />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">
                                                    {delivery.deliveryType === 'broadcast' ? '全体配信' : 'セグメント配信'}
                                                </span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                                                    予約中
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">
                                                対象: {delivery.targetCount}人
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {delivery.scheduledAt &&
                                                    format(parseISO(delivery.scheduledAt), 'M月d日 HH:mm', { locale: ja })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* クイックアクション */}
                <div className="mt-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link to="/users">
                            <Card hover className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                                    <UsersIcon />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">ユーザー一覧</p>
                                    <p className="text-sm text-gray-500">ユーザーの管理・検索</p>
                                </div>
                            </Card>
                        </Link>
                        <Link to="/delivery">
                            <Card hover className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100 text-accent-600">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">新規配信</p>
                                    <p className="text-sm text-gray-500">メッセージを配信</p>
                                </div>
                            </Card>
                        </Link>
                        <Link to="/settings">
                            <Card hover className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">設定</p>
                                    <p className="text-sm text-gray-500">システム設定</p>
                                </div>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
