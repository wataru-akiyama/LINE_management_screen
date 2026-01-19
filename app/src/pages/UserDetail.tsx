import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Button } from '../components/common/Button';
import { PlanBadge } from '../components/common/PlanBadge';
import { TagBadge, TagList } from '../components/common/TagBadge';
import { Card } from '../components/common/Card';
import { RadarChart, ActivityTimeline, EngagementScoreDisplay, NextActionsDisplay, ActivityHeatmap, SimilarUsers } from '../components/analytics';
import type { User, UserSurveyAnswer, DiagnosisHistory } from '../types';
import { mockSurveys } from '../mocks/data';
import { getMockUserAnalytics } from '../mocks/userAnalytics';
import { getDiagnosisHistory } from '../api/diagnosis';
import { getUser } from '../api/users';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

type TabType = 'profile' | 'diagnosis' | 'surveys' | 'analytics';

const ChatIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const EditIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

export function UserDetail() {
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [diagnosisHistory, setDiagnosisHistory] = useState<DiagnosisHistory[]>([]);
    const [loadingDiagnosis, setLoadingDiagnosis] = useState(false);

    // ユーザー情報の取得
    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;
            setLoading(true);
            try {
                const userData = await getUser(userId);
                setUser(userData);
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    const surveys = user ? mockSurveys.filter((s) => s.userId === user.userId) : [];

    useEffect(() => {
        if (user && activeTab === 'diagnosis') {
            setLoadingDiagnosis(true);
            getDiagnosisHistory(user.userId).then(history => {
                setDiagnosisHistory(history);
                setLoadingDiagnosis(false);
            });
        }
    }, [activeTab, user?.userId]); // user.userId check included via user check inside

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!user) {
        return <div className="p-6">ユーザーが見つかりません</div>;
    }

    const tabs = [
        { id: 'profile' as TabType, label: 'プロフィール' },
        { id: 'diagnosis' as TabType, label: '診断記録' },
        { id: 'surveys' as TabType, label: 'アンケート', count: surveys.length },
        { id: 'analytics' as TabType, label: '分析' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Header
                title="ユーザー詳細"
                showBack={true}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* ヘッダー情報 */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-bold text-2xl">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                                    <PlanBadge plan={user.plan} />
                                </div>
                                <p className="text-gray-500">{user.teamName}</p>
                                <p className="text-sm text-gray-400">{user.lineId}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {/* 編集機能はモックなので一旦ボタンだけ表示（機能未実装） */}
                            <Button variant="secondary" size="sm" onClick={() => { }}>
                                <EditIcon />
                                <span className="ml-1">編集</span>
                            </Button>
                            <Link to={`/users/${user.userId}/chat`}>
                                <Button variant="primary" size="sm">
                                    <ChatIcon />
                                    <span className="ml-1">チャット</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* タブ */}
                <div className="flex border-b border-gray-200 mb-6 bg-white px-4 rounded-t-lg shadow-sm">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-gray-100">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* タブコンテンツ */}
                <div>
                    {activeTab === 'profile' && (
                        <ProfileTab user={user} />
                    )}

                    {activeTab === 'diagnosis' && (
                        <DiagnosisTab
                            history={diagnosisHistory}
                            loading={loadingDiagnosis}
                            currentDiagnosis={user.diagnosis}
                        />
                    )}
                    {activeTab === 'surveys' && (
                        <SurveysTab surveys={surveys} />
                    )}
                    {activeTab === 'analytics' && user && (
                        <AnalyticsTab userId={user.userId} />
                    )}
                </div>
            </div>
        </div>
    );
}

// サブコンポーネント (ProfileTab, DiagnosisTab, SurveysTab)
// 元のファイルからコピー

// プロフィールタブ
function ProfileTab({ user }: { user: User }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 基本情報 */}
            <Card>
                <h3 className="font-semibold text-gray-900 mb-4">基本情報</h3>
                <dl className="space-y-3">
                    <div className="flex justify-between">
                        <dt className="text-gray-500">学年</dt>
                        <dd className="font-medium">{user.grade}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-gray-500">地域</dt>
                        <dd className="font-medium">{user.region}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-gray-500">都道府県</dt>
                        <dd className="font-medium">{user.prefecture}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-gray-500">チーム</dt>
                        <dd className="font-medium">{user.teamName}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-gray-500">プラン</dt>
                        <dd><PlanBadge plan={user.plan} size="sm" /></dd>
                    </div>
                </dl>
            </Card>

            {/* タグ */}
            <Card>
                <h3 className="font-semibold text-gray-900 mb-4">タグ</h3>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-500 mb-2">システムタグ</p>
                        <div className="flex flex-wrap gap-1">
                            <TagBadge tag={user.grade} variant="grade" />
                            <TagBadge tag={user.region} variant="region" />
                            {user.diagnosis && (
                                <TagBadge tag={user.diagnosis.type} variant="diagnosis" />
                            )}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-2">カスタムタグ</p>
                        {user.customTags && user.customTags.length > 0 ? (
                            <TagList tags={user.customTags} variant="custom" />
                        ) : (
                            <p className="text-gray-400 text-sm">カスタムタグなし</p>
                        )}
                    </div>
                </div>
            </Card>

            {/* 志望校 */}
            <Card>
                <h3 className="font-semibold text-gray-900 mb-4">志望校</h3>
                {user.universities && user.universities.length > 0 ? (
                    <ul className="space-y-2">
                        {user.universities.map((uni, index) => (
                            <li key={index} className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-600 text-xs font-medium">
                                    {index + 1}
                                </span>
                                <span>{uni}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 text-sm">志望校未登録</p>
                )}
            </Card>

            {/* メタ情報 */}
            <Card>
                <h3 className="font-semibold text-gray-900 mb-4">登録情報</h3>
                <dl className="space-y-3">
                    <div className="flex justify-between">
                        <dt className="text-gray-500">登録日</dt>
                        <dd className="font-medium">
                            {user.registeredAt ? format(parseISO(user.registeredAt), 'yyyy年M月d日 HH:mm', { locale: ja }) : '-'}
                        </dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-gray-500">最終更新</dt>
                        <dd className="font-medium">
                            {user.updatedAt ? format(parseISO(user.updatedAt), 'yyyy年M月d日 HH:mm', { locale: ja }) : '-'}
                        </dd>
                    </div>
                    {user.diagnosis && user.diagnosis.completedAt && (
                        <div className="flex justify-between">
                            <dt className="text-gray-500">診断完了</dt>
                            <dd className="font-medium">
                                {format(parseISO(user.diagnosis.completedAt), 'yyyy年M月d日 HH:mm', { locale: ja })}
                            </dd>
                        </div>
                    )}
                </dl>
            </Card>
        </div>
    );
}

// 診断記録タブ
function DiagnosisTab({
    history,
    loading,
    currentDiagnosis
}: {
    history: DiagnosisHistory[];
    loading: boolean;
    currentDiagnosis?: { type: string; completedAt: string };
}) {
    const answerLabels: Record<string, string> = {
        yes: 'そう思う',
        no: 'そう思わない',
        unknown: 'わからない'
    };

    const questionTexts: Record<string, string> = {
        q1: '将来、サッカーを仕事にしたい',
        q2: '強い相手と戦える環境に身を置きたい',
        q3: 'チームで成し遂げることの方が嬉しい',
        q4: 'サッカー以外の大学生活も充実させたい',
        q5: '運営を自分たちで考えるチームに興味がある',
        q6: '厳しい環境で自分を追い込みたい',
        q7: 'サッカーをしている時間そのものが好き',
        q8: '選手以外の形でもサッカーに関わりたい'
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">読み込み中...</p>
            </div>
        );
    }

    if (history.length === 0 && !currentDiagnosis) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">診断記録がありません</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 現在の診断結果 */}
            {currentDiagnosis && (
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">現在の診断結果</h3>
                        <span className="text-sm text-gray-500">
                            {format(parseISO(currentDiagnosis.completedAt), 'yyyy年M月d日', { locale: ja })}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">
                            {currentDiagnosis.type.includes('プロ志向') && '🎯'}
                            {currentDiagnosis.type.includes('チャレンジ') && '🔥'}
                            {currentDiagnosis.type.includes('チーム成長') && '📈'}
                            {currentDiagnosis.type.includes('経験重視') && '🌟'}
                            {currentDiagnosis.type.includes('エンジョイ') && '⚽'}
                            {currentDiagnosis.type.includes('サポート') && '🤝'}
                        </span>
                        <span className="text-xl font-bold text-gray-900">{currentDiagnosis.type}</span>
                    </div>
                </Card>
            )}

            {/* 診断履歴 */}
            {history.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-900 mb-4">診断履歴 ({history.length}回)</h3>
                    <div className="space-y-4">
                        {history.map((record, index) => (
                            <Card key={record.historyId}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-600 text-xs font-bold">
                                            {history.length - index}
                                        </span>
                                        <span className="font-medium text-gray-900">{record.resultName}</span>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {format(parseISO(record.diagnosisDate), 'yyyy年M月d日 HH:mm', { locale: ja })}
                                    </span>
                                </div>

                                {/* 回答詳細 */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm font-medium text-gray-700 mb-3">回答詳細</p>
                                    <div className="space-y-2">
                                        {Object.entries(record.answers).map(([key, value]) => (
                                            value && (
                                                <div key={key} className="flex items-start gap-2 text-sm">
                                                    <span className="text-gray-500 flex-shrink-0 w-16">{key.toUpperCase()}</span>
                                                    <span className="text-gray-700 flex-1">{questionTexts[key]}</span>
                                                    <span className={`font-medium flex-shrink-0 ${value === 'yes' ? 'text-green-600' :
                                                        value === 'no' ? 'text-red-600' :
                                                            'text-gray-500'
                                                        }`}>
                                                        {answerLabels[value] || value}
                                                    </span>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>

                                {/* スコア */}
                                {record.scores && Object.keys(record.scores).length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">スコア</p>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(record.scores)
                                                .sort(([, a], [, b]) => (b as number) - (a as number))
                                                .map(([type, score]) => (
                                                    <span
                                                        key={type}
                                                        className={`px-2 py-1 rounded text-xs font-medium ${type === record.resultType
                                                            ? 'bg-primary-100 text-primary-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                            }`}
                                                    >
                                                        {type}: {(score as number).toFixed(1)}
                                                    </span>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// アンケートタブ
function SurveysTab({ surveys }: { surveys: UserSurveyAnswer[] }) {
    if (surveys.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">アンケート回答がありません</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {surveys.map((survey) => (
                <Card key={survey.surveyId}>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{survey.surveyType}</h4>
                        <span className="text-sm text-gray-500">
                            {format(parseISO(survey.submittedAt), 'yyyy年M月d日', { locale: ja })}
                        </span>
                    </div>
                    <dl className="space-y-2">
                        {Object.entries(survey.answers).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                                <dt className="text-gray-500">{key}</dt>
                                <dd className="font-medium">{value as string}</dd>
                            </div>
                        ))}
                    </dl>
                </Card>
            ))}
        </div>
    );
}

// 分析タブ
function AnalyticsTab({ userId }: { userId: string }) {
    const analytics = getMockUserAnalytics(userId);

    const handleSimilarUserClick = (targetUserId: string) => {
        window.open(`/users/${targetUserId}`, '_blank');
    };

    return (
        <div className="space-y-6">
            {/* 上段: レーダーチャート + エンゲージメントスコア */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-xl">📊</span>
                        能力値チャート
                    </h3>
                    <RadarChart stats={analytics.abilities} />
                </Card>

                <Card>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-xl">🔥</span>
                        エンゲージメントスコア
                    </h3>
                    <EngagementScoreDisplay engagement={analytics.engagement} />
                </Card>
            </div>

            {/* 中段: アクティビティタイムライン + ネクストアクション */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-xl">📅</span>
                        活動タイムライン
                    </h3>
                    <ActivityTimeline activities={analytics.activities} maxItems={7} />
                </Card>

                <Card>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-xl">💡</span>
                        ネクストアクション
                    </h3>
                    <NextActionsDisplay actions={analytics.nextActions} />
                </Card>
            </div>

            {/* 下段: ヒートマップ + 類似ユーザー */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analytics.heatmapData && (
                    <Card>
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="text-xl">🗓️</span>
                            活動ヒートマップ
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">過去3ヶ月間のアクティビティ</p>
                        <ActivityHeatmap data={analytics.heatmapData} />
                    </Card>
                )}

                {analytics.similarUsers && (
                    <Card>
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="text-xl">👥</span>
                            類似ユーザー
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">同じ属性・診断結果のユーザー</p>
                        <SimilarUsers
                            users={analytics.similarUsers}
                            onUserClick={handleSimilarUserClick}
                        />
                    </Card>
                )}
            </div>
        </div>
    );
}
