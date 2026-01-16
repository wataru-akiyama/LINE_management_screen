import { useState } from 'react';
import { Modal, ConfirmDialog } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { PlanBadge } from '../common/PlanBadge';
import { TagBadge } from '../common/TagBadge';
import type { User } from '../../types';
import { updateUser } from '../../api/users';
import { useStore } from '../../store/useStore';

interface UserEditModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedUser: User) => void;
}

export function UserEditModal({ user, isOpen, onClose, onSave }: UserEditModalProps) {
    const { addNotification } = useStore();
    const [formData, setFormData] = useState({
        name: user.name,
        plan: user.plan,
        customTags: user.customTags || [],
        universities: user.universities || [],
    });
    const [newTag, setNewTag] = useState('');
    const [newUniversity, setNewUniversity] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showPlanConfirm, setShowPlanConfirm] = useState(false);
    const [pendingPlan, setPendingPlan] = useState<'FREE' | 'BASIC' | null>(null);

    const handlePlanChange = (newPlan: 'FREE' | 'BASIC') => {
        if (newPlan !== formData.plan) {
            setPendingPlan(newPlan);
            setShowPlanConfirm(true);
        }
    };

    const confirmPlanChange = () => {
        if (pendingPlan) {
            setFormData({ ...formData, plan: pendingPlan });
        }
        setShowPlanConfirm(false);
        setPendingPlan(null);
    };

    const handleAddTag = () => {
        if (newTag.trim() && !formData.customTags.includes(newTag.trim())) {
            setFormData({ ...formData, customTags: [...formData.customTags, newTag.trim()] });
            setNewTag('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData({ ...formData, customTags: formData.customTags.filter((t) => t !== tag) });
    };

    const handleAddUniversity = () => {
        if (newUniversity.trim() && !formData.universities.includes(newUniversity.trim())) {
            setFormData({ ...formData, universities: [...formData.universities, newUniversity.trim()] });
            setNewUniversity('');
        }
    };

    const handleRemoveUniversity = (uni: string) => {
        setFormData({ ...formData, universities: formData.universities.filter((u) => u !== uni) });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await updateUser(user.userId, formData);
            if (result.success) {
                addNotification('ユーザー情報を更新しました', 'success');
                onSave({ ...user, ...formData });
                onClose();
            } else {
                addNotification('更新に失敗しました', 'error');
            }
        } catch (error) {
            addNotification('エラーが発生しました', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="ユーザー編集" size="lg">
                <div className="space-y-6">
                    {/* 名前 */}
                    <div>
                        <Input
                            label="名前"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* プラン */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">プラン</label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => handlePlanChange('FREE')}
                                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${formData.plan === 'FREE'
                                        ? 'border-gray-400 bg-gray-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <PlanBadge plan="FREE" size="lg" />
                                <p className="text-sm text-gray-500 mt-2">無料プラン</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => handlePlanChange('BASIC')}
                                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${formData.plan === 'BASIC'
                                        ? 'border-basic-400 bg-basic-50'
                                        : 'border-gray-200 hover:border-basic-300'
                                    }`}
                            >
                                <PlanBadge plan="BASIC" size="lg" />
                                <p className="text-sm text-gray-500 mt-2">有料プラン</p>
                            </button>
                        </div>
                    </div>

                    {/* カスタムタグ */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">カスタムタグ</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                placeholder="タグを追加..."
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <Button variant="secondary" size="sm" onClick={handleAddTag}>
                                追加
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.customTags.map((tag) => (
                                <TagBadge key={tag} tag={tag} onRemove={() => handleRemoveTag(tag)} />
                            ))}
                            {formData.customTags.length === 0 && (
                                <p className="text-sm text-gray-400">タグがありません</p>
                            )}
                        </div>
                    </div>

                    {/* 志望校 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">志望校</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newUniversity}
                                onChange={(e) => setNewUniversity(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddUniversity()}
                                placeholder="志望校を追加..."
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <Button variant="secondary" size="sm" onClick={handleAddUniversity}>
                                追加
                            </Button>
                        </div>
                        <ul className="space-y-2">
                            {formData.universities.map((uni, index) => (
                                <li key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-600 text-xs font-medium">
                                            {index + 1}
                                        </span>
                                        <span className="text-sm">{uni}</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveUniversity(uni)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        ×
                                    </button>
                                </li>
                            ))}
                            {formData.universities.length === 0 && (
                                <p className="text-sm text-gray-400">志望校が登録されていません</p>
                            )}
                        </ul>
                    </div>

                    {/* アクション */}
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

            <ConfirmDialog
                isOpen={showPlanConfirm}
                onClose={() => setShowPlanConfirm(false)}
                onConfirm={confirmPlanChange}
                title="プラン変更の確認"
                message={`プランを${pendingPlan}に変更しますか？`}
                confirmText="変更する"
                variant="primary"
            />
        </>
    );
}
