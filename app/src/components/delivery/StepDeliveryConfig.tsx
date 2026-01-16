import { useState, useEffect } from 'react';
import type { StepDeliveryConfig } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input, Textarea } from '../common/Input';
import { getStepDeliveryConfigs, updateStepDeliveryConfig } from '../../api/delivery';
import { useStore } from '../../store/useStore';

const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

export function StepDeliveryConfigList() {
    const { addNotification } = useStore();
    const [configs, setConfigs] = useState<StepDeliveryConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedConfig, setSelectedConfig] = useState<StepDeliveryConfig | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        setIsLoading(true);
        try {
            const data = await getStepDeliveryConfigs();
            setConfigs(data);
        } catch (error) {
            console.error('ステップ配信設定取得エラー:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleActive = async (config: StepDeliveryConfig) => {
        try {
            await updateStepDeliveryConfig(config.stepId, { isActive: !config.isActive });
            setConfigs(
                configs.map((c) =>
                    c.stepId === config.stepId ? { ...c, isActive: !c.isActive } : c
                )
            );
            addNotification(
                `「${config.stepName}」を${!config.isActive ? '有効' : '無効'}にしました`,
                'success'
            );
        } catch (error) {
            addNotification('更新に失敗しました', 'error');
        }
    };

    const handleEdit = (config: StepDeliveryConfig) => {
        setSelectedConfig(config);
        setIsEditOpen(true);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">ステップ配信設定</h3>
                <Button variant="secondary" size="sm">
                    <PlusIcon />
                    <span className="ml-1">新規追加</span>
                </Button>
            </div>

            {configs.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">ステップ配信設定がありません</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {configs.map((config) => (
                        <Card key={config.stepId} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold ${config.isActive
                                            ? 'bg-accent-100 text-accent-600'
                                            : 'bg-gray-100 text-gray-400'
                                        }`}
                                >
                                    {config.daysAfterRegistration}日
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">{config.stepName}</span>
                                        {!config.isActive && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                                無効
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        登録後{config.daysAfterRegistration}日目に配信
                                        {config.targetFilter && Object.keys(config.targetFilter).length > 0 && (
                                            <span className="ml-2 text-gray-400">
                                                ({Object.entries(config.targetFilter).map(([k, v]) => `${k}: ${v}`).join(', ')})
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleToggleActive(config)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.isActive ? 'bg-accent-500' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.isActive ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(config)}>
                                    編集
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* 編集モーダル */}
            {selectedConfig && (
                <StepDeliveryEditModal
                    config={selectedConfig}
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    onSave={(updated) => {
                        setConfigs(configs.map((c) => (c.stepId === updated.stepId ? updated : c)));
                        setIsEditOpen(false);
                    }}
                />
            )}
        </div>
    );
}

// 編集モーダル
interface StepDeliveryEditModalProps {
    config: StepDeliveryConfig;
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: StepDeliveryConfig) => void;
}

function StepDeliveryEditModal({ config, isOpen, onClose, onSave }: StepDeliveryEditModalProps) {
    const { addNotification } = useStore();
    const [formData, setFormData] = useState({
        stepName: config.stepName,
        daysAfterRegistration: config.daysAfterRegistration,
        messageContent: typeof config.messageContent === 'object' && 'text' in config.messageContent
            ? (config.messageContent as { text: string }).text
            : '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateStepDeliveryConfig(config.stepId, {
                stepName: formData.stepName,
                daysAfterRegistration: formData.daysAfterRegistration,
                messageContent: { type: 'text', text: formData.messageContent },
            });
            onSave({
                ...config,
                stepName: formData.stepName,
                daysAfterRegistration: formData.daysAfterRegistration,
                messageContent: { type: 'text', text: formData.messageContent },
            });
            addNotification('ステップ配信設定を更新しました', 'success');
        } catch (error) {
            addNotification('更新に失敗しました', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="ステップ配信設定の編集" size="md">
            <div className="space-y-4">
                <Input
                    label="ステップ名"
                    value={formData.stepName}
                    onChange={(e) => setFormData({ ...formData, stepName: e.target.value })}
                />
                <Input
                    label="配信タイミング（登録後日数）"
                    type="number"
                    min={0}
                    value={formData.daysAfterRegistration}
                    onChange={(e) =>
                        setFormData({ ...formData, daysAfterRegistration: parseInt(e.target.value) || 0 })
                    }
                />
                <Textarea
                    label="配信メッセージ"
                    value={formData.messageContent}
                    onChange={(e) => setFormData({ ...formData, messageContent: e.target.value })}
                    rows={4}
                />
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button variant="secondary" onClick={onClose}>
                        キャンセル
                    </Button>
                    <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
                        保存
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
