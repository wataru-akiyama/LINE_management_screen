import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { getRichMenus, getRichMenuPlanMappings, updateRichMenuPlanMapping, applyRichMenusToAllUsers } from '../api/richmenus';
import { useStore } from '../store/useStore';
import type { RichMenu, RichMenuPlanMapping } from '../types';

const BackIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

// プラン情報
// 注意: IDはスプレッドシートのplanカラムの値と一致させる必要があります
const PLANS = [
    { id: 'フリープラン', name: 'Free プラン', description: '無料プランのユーザーに表示' },
    { id: 'Basicプラン', name: 'Basic プラン', description: '有料プランのユーザーに表示' },
];

export function RichMenuPlans() {
    const { addNotification } = useStore();
    const [menus, setMenus] = useState<RichMenu[]>([]);
    const [mappings, setMappings] = useState<RichMenuPlanMapping[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [savingPlan, setSavingPlan] = useState<string | null>(null);
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [menusData, mappingsData] = await Promise.all([
                getRichMenus(),
                getRichMenuPlanMappings()
            ]);
            setMenus(menusData.menus.filter(m => m.status === 'active')); // 公開済みのみ
            setMappings(mappingsData.mappings);
        } catch (error) {
            console.error('Load error:', error);
            addNotification('データの読み込みに失敗しました', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const getSelectedMenuId = (plan: string): string => {
        const mapping = mappings.find(m => m.plan === plan);
        return mapping?.richMenuId || '';
    };

    const handleMenuSelect = async (plan: string, richMenuId: string) => {
        setSavingPlan(plan);
        try {
            const result = await updateRichMenuPlanMapping(plan, richMenuId);
            if (result.success) {
                // ローカル状態を更新
                setMappings(prev => {
                    const existing = prev.find(m => m.plan === plan);
                    if (existing) {
                        return prev.map(m => m.plan === plan ? { ...m, richMenuId } : m);
                    }
                    return [...prev, { plan, richMenuId }];
                });
                addNotification(`${plan} の設定を保存しました`, 'success');
            } else {
                addNotification('設定の保存に失敗しました', 'error');
            }
        } catch (error) {
            console.error('Save error:', error);
            addNotification('保存中にエラーが発生しました', 'error');
        } finally {
            setSavingPlan(null);
        }
    };

    const handleApplyToAll = async () => {
        if (!confirm('現在の設定を全ユーザーに適用しますか？\n（ユーザー数によっては時間がかかる場合があります）')) return;

        setIsApplying(true);
        try {
            const result = await applyRichMenusToAllUsers();
            if (result.success) {
                addNotification('全ユーザーへの適用が完了しました', 'success');
            } else {
                addNotification('適用に失敗しました', 'error');
            }
        } catch (error) {
            console.error('Apply error:', error);
            addNotification('処理中にエラーが発生しました', 'error');
        } finally {
            setIsApplying(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-4 md:p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
                    <div className="space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            {/* ヘッダー */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <Link
                        to="/richmenus"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <BackIcon />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">プラン別メニュー設定</h1>
                        <p className="text-gray-500 mt-1">各プランのユーザーに表示するリッチメニューを設定</p>
                    </div>
                </div>
                <Button
                    variant="primary"
                    onClick={handleApplyToAll}
                    disabled={isApplying || menus.length === 0}
                >
                    {isApplying ? '適用中...' : '設定を全ユーザーに反映'}
                </Button>
            </div>

            {/* 公開済みメニューがない場合 */}
            {menus.length === 0 ? (
                <Card className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">公開済みのメニューがありません</h3>
                    <p className="text-gray-500 mb-4">
                        先にリッチメニューを作成して公開してください
                    </p>
                    <Link to="/richmenus/new">
                        <Button variant="primary">メニューを作成</Button>
                    </Link>
                </Card>
            ) : (
                <div className="space-y-6">
                    {PLANS.map(plan => (
                        <Card key={plan.id} className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">{plan.name}</h2>
                                    <p className="text-sm text-gray-500">{plan.description}</p>
                                </div>
                                {savingPlan === plan.id && (
                                    <span className="text-sm text-primary-600">保存中...</span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* 「なし」オプション */}
                                <button
                                    onClick={() => handleMenuSelect(plan.id, '')}
                                    disabled={savingPlan === plan.id}
                                    className={`p-4 border-2 rounded-lg text-left transition-colors ${getSelectedMenuId(plan.id) === ''
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-700">設定なし</span>
                                        {getSelectedMenuId(plan.id) === '' && (
                                            <CheckIcon />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">デフォルトメニュー</p>
                                </button>

                                {/* メニュー選択 */}
                                {menus.map(menu => (
                                    <button
                                        key={menu.id}
                                        onClick={() => handleMenuSelect(plan.id, menu.id)}
                                        disabled={savingPlan === plan.id}
                                        className={`p-4 border-2 rounded-lg text-left transition-colors ${getSelectedMenuId(plan.id) === menu.id
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-900">{menu.name}</span>
                                            {getSelectedMenuId(plan.id) === menu.id && (
                                                <CheckIcon />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {menu.chatBarText || 'メニュー'}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    ))}

                    {/* 説明 */}
                    <Card className="p-4 bg-blue-50 border-blue-200">
                        <h3 className="font-medium text-blue-900 mb-2">💡 プラン別メニューの仕組み</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• ユーザーがプランを変更すると、自動で対応するメニューに切り替わります</li>
                            <li>• 「設定なし」の場合は、LINEのデフォルトメニュー（または設定なし）が表示されます</li>
                            <li>• 変更を全ユーザーに適用するには右上の「設定を全ユーザーに反映」ボタンを押してください</li>
                        </ul>
                    </Card>
                </div>
            )}
        </div>
    );
}
