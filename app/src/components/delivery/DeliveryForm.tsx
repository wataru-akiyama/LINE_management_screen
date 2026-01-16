import { useState } from 'react';
import { Button } from '../common/Button';
import { Textarea } from '../common/Input';
import { TargetSelector } from './TargetSelector';
import { Card } from '../common/Card';
import { ConfirmDialog } from '../common/Modal';
import type { DeliveryType, DeliveryFilter } from '../../types';
import { mockUsers } from '../../mocks/data';

interface DeliveryFormProps {
    onSubmit: (data: {
        type: DeliveryType;
        filter: DeliveryFilter | null;
        content: string;
        scheduledAt?: string;
    }) => Promise<void>;
    isSubmitting?: boolean;
}

const BroadcastIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
);

const SegmentIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const ScheduleIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export function DeliveryForm({ onSubmit, isSubmitting }: DeliveryFormProps) {
    const [step, setStep] = useState(1);
    const [deliveryType, setDeliveryType] = useState<DeliveryType | null>(null);
    const [filter, setFilter] = useState<DeliveryFilter>({});
    const [content, setContent] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    // 対象者数を計算
    const estimatedCount = calculateEstimatedCount(filter, deliveryType);

    const handleTypeSelect = (type: DeliveryType) => {
        setDeliveryType(type);
        setStep(2);
    };

    const handleNext = () => {
        if (step === 2 && deliveryType === 'segment') {
            setStep(3);
        } else if (step === 2 || step === 3) {
            if (deliveryType === 'scheduled') {
                setStep(4);
            } else {
                setStep(5);
            }
        } else if (step === 4) {
            setStep(5);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleSubmit = async () => {
        await onSubmit({
            type: deliveryType!,
            filter: deliveryType === 'segment' ? filter : null,
            content,
            scheduledAt: deliveryType === 'scheduled' ? scheduledAt : undefined,
        });
        setShowConfirm(false);
        // リセット
        setStep(1);
        setDeliveryType(null);
        setFilter({});
        setContent('');
        setScheduledAt('');
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* ステップインジケーター */}
            <div className="flex items-center justify-center mb-8">
                {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="flex items-center">
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${s <= step
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                }`}
                        >
                            {s}
                        </div>
                        {s < 5 && (
                            <div
                                className={`w-12 h-1 transition-colors ${s < step ? 'bg-primary-500' : 'bg-gray-200'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* ステップ1: 配信タイプ選択 */}
            {step === 1 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
                        配信タイプを選択
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => handleTypeSelect('broadcast')}
                            className="p-6 rounded-xl border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 mb-4">
                                <BroadcastIcon />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">全体配信</h3>
                            <p className="text-sm text-gray-500">すべてのユーザーに配信</p>
                        </button>

                        <button
                            onClick={() => handleTypeSelect('segment')}
                            className="p-6 rounded-xl border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100 text-accent-600 mb-4">
                                <SegmentIcon />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">セグメント配信</h3>
                            <p className="text-sm text-gray-500">条件で絞り込んで配信</p>
                        </button>

                        <button
                            onClick={() => handleTypeSelect('scheduled')}
                            className="p-6 rounded-xl border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-basic-100 text-basic-600 mb-4">
                                <ScheduleIcon />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">予約配信</h3>
                            <p className="text-sm text-gray-500">日時を指定して配信</p>
                        </button>
                    </div>
                </div>
            )}

            {/* ステップ2: メッセージ作成（broadcastの場合）、対象選択（segmentの場合） */}
            {step === 2 && (
                <Card>
                    {deliveryType === 'segment' ? (
                        <TargetSelector
                            filter={filter}
                            onChange={setFilter}
                            estimatedCount={estimatedCount}
                        />
                    ) : (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900">メッセージを入力</h3>
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="配信するメッセージを入力してください..."
                                rows={6}
                            />
                            <p className="text-sm text-gray-500">
                                {content.length} 文字
                            </p>
                        </div>
                    )}
                    <div className="flex justify-between mt-6">
                        <Button variant="secondary" onClick={handleBack}>
                            戻る
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleNext}
                            disabled={deliveryType !== 'segment' && !content.trim()}
                        >
                            次へ
                        </Button>
                    </div>
                </Card>
            )}

            {/* ステップ3: メッセージ作成（segmentの場合） */}
            {step === 3 && (
                <Card>
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">メッセージを入力</h3>
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="配信するメッセージを入力してください..."
                            rows={6}
                        />
                        <p className="text-sm text-gray-500">
                            {content.length} 文字
                        </p>
                    </div>
                    <div className="flex justify-between mt-6">
                        <Button variant="secondary" onClick={handleBack}>
                            戻る
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleNext}
                            disabled={!content.trim()}
                        >
                            次へ
                        </Button>
                    </div>
                </Card>
            )}

            {/* ステップ4: 日時設定（予約配信の場合） */}
            {step === 4 && deliveryType === 'scheduled' && (
                <Card>
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">配信日時を設定</h3>
                        <input
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="flex justify-between mt-6">
                        <Button variant="secondary" onClick={handleBack}>
                            戻る
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleNext}
                            disabled={!scheduledAt}
                        >
                            次へ
                        </Button>
                    </div>
                </Card>
            )}

            {/* ステップ5: 確認 */}
            {step === 5 && (
                <Card>
                    <h3 className="font-semibold text-gray-900 mb-4">配信内容の確認</h3>
                    <dl className="space-y-3 mb-6">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <dt className="text-gray-500">配信タイプ</dt>
                            <dd className="font-medium">
                                {deliveryType === 'broadcast' && '全体配信'}
                                {deliveryType === 'segment' && 'セグメント配信'}
                                {deliveryType === 'scheduled' && '予約配信'}
                            </dd>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <dt className="text-gray-500">対象者数</dt>
                            <dd className="font-medium">{estimatedCount}人</dd>
                        </div>
                        {deliveryType === 'scheduled' && scheduledAt && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <dt className="text-gray-500">配信日時</dt>
                                <dd className="font-medium">{new Date(scheduledAt).toLocaleString('ja-JP')}</dd>
                            </div>
                        )}
                    </dl>
                    <div className="p-4 bg-gray-50 rounded-lg mb-6">
                        <p className="text-sm text-gray-500 mb-2">配信メッセージ</p>
                        <p className="whitespace-pre-wrap">{content}</p>
                    </div>
                    <div className="flex justify-between">
                        <Button variant="secondary" onClick={handleBack}>
                            戻る
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setShowConfirm(true)}
                            isLoading={isSubmitting}
                        >
                            配信する
                        </Button>
                    </div>
                </Card>
            )}

            <ConfirmDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleSubmit}
                title="配信の確認"
                message={`${estimatedCount}人にメッセージを配信します。よろしいですか？`}
                confirmText="配信する"
                variant="primary"
            />
        </div>
    );
}

// 対象者数を計算
function calculateEstimatedCount(filter: DeliveryFilter, deliveryType: DeliveryType | null): number {
    if (deliveryType === 'broadcast') {
        return mockUsers.length;
    }

    let users = [...mockUsers];

    if (filter.grade) {
        users = users.filter((u) => u.grade === filter.grade);
    }
    if (filter.region) {
        users = users.filter((u) => u.region === filter.region);
    }
    if (filter.plan) {
        users = users.filter((u) => u.plan === filter.plan);
    }

    return users.length;
}
