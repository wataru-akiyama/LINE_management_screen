import { useState } from 'react';
import { TagBadge } from '../common/TagBadge';
import { PlanBadge } from '../common/PlanBadge';
import { Button } from '../common/Button';
import type { User } from '../../types';
import { updateUser } from '../../api/users';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

interface ChatSidePanelProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onUserUpdate: (user: User) => void;
}

const CloseIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

export function ChatSidePanel({ user, isOpen, onClose, onUserUpdate }: ChatSidePanelProps) {
    const [newTag, setNewTag] = useState('');
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [editingMemo, setEditingMemo] = useState(false);
    const [memo, setMemo] = useState(user.memo || '');



    const handleAddTag = async () => {
        if (!newTag.trim()) return;

        const currentTags = user.customTags || [];
        if (currentTags.includes(newTag.trim())) {
            setNewTag('');
            setIsAddingTag(false);
            return;
        }

        const updatedTags = [...currentTags, newTag.trim()];
        const result = await updateUser(user.userId, { customTags: updatedTags });

        if (result.success) {
            onUserUpdate({ ...user, customTags: updatedTags });
        }

        setNewTag('');
        setIsAddingTag(false);
    };

    const handleRemoveTag = async (tagToRemove: string) => {
        const updatedTags = (user.customTags || []).filter(t => t !== tagToRemove);
        const result = await updateUser(user.userId, { customTags: updatedTags });

        if (result.success) {
            onUserUpdate({ ...user, customTags: updatedTags });
        }
    };

    const handleSaveMemo = async () => {
        const result = await updateUser(user.userId, { memo });
        if (result.success) {
            onUserUpdate({ ...user, memo });
            setEditingMemo(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="w-80 border-l border-gray-200 bg-white flex flex-col h-full overflow-hidden">
            {/* ヘッダー */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">ユーザー情報</h3>
                <button
                    onClick={onClose}
                    className="p-1 rounded hover:bg-gray-100 text-gray-500"
                >
                    <CloseIcon />
                </button>
            </div>

            {/* ユーザー情報 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* プロフィール */}
                <div className="text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-bold text-2xl mx-auto mb-3">
                        {user.name.charAt(0)}
                    </div>
                    <h4 className="font-semibold text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-500">{user.teamName}</p>
                    <div className="flex justify-center gap-2 mt-2">
                        <PlanBadge plan={user.plan} size="sm" />
                    </div>
                </div>

                {/* 未読数 */}
                {user.unreadCount !== undefined && user.unreadCount > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-700">
                            未読メッセージ: <span className="font-bold">{user.unreadCount}件</span>
                        </p>
                    </div>
                )}

                {/* 基本情報 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">基本情報</label>
                    <dl className="space-y-2 text-sm">
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
                            <dt className="text-gray-500">登録日</dt>
                            <dd className="font-medium">
                                {user.registeredAt ? format(parseISO(user.registeredAt), 'yyyy/M/d', { locale: ja }) : '-'}
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* 診断結果 */}
                {user.diagnosis && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">志向性診断</label>
                        <div className="bg-primary-50 rounded-lg p-3">
                            <p className="font-medium text-primary-700">{user.diagnosis.type}</p>
                            {user.diagnosis.completedAt && (
                                <p className="text-xs text-primary-500 mt-1">
                                    {format(parseISO(user.diagnosis.completedAt), 'yyyy/M/d', { locale: ja })}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* タグ */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">タグ</label>
                    <div className="flex flex-wrap gap-2">
                        {/* システムタグ */}
                        <TagBadge tag={user.grade} variant="grade" size="sm" />
                        <TagBadge tag={user.region} variant="region" size="sm" />

                        {/* カスタムタグ */}
                        {Array.isArray(user.customTags) && user.customTags.map(tag => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700"
                            >
                                {tag}
                                <button
                                    onClick={() => handleRemoveTag(tag)}
                                    className="hover:text-purple-900"
                                >
                                    ×
                                </button>
                            </span>
                        ))}

                        {/* タグ追加 */}
                        {isAddingTag ? (
                            <div className="flex items-center gap-1">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                    placeholder="タグ名"
                                    className="w-20 px-2 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    autoFocus
                                />
                                <button
                                    onClick={handleAddTag}
                                    className="text-xs text-primary-600 hover:text-primary-800"
                                >
                                    追加
                                </button>
                                <button
                                    onClick={() => { setIsAddingTag(false); setNewTag(''); }}
                                    className="text-xs text-gray-500 hover:text-gray-700"
                                >
                                    取消
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAddingTag(true)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                            >
                                <PlusIcon />
                                追加
                            </button>
                        )}
                    </div>
                </div>

                {/* メモ */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">メモ</label>
                    {editingMemo ? (
                        <div>
                            <textarea
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                rows={4}
                                placeholder="メモを入力..."
                            />
                            <div className="flex gap-2 mt-2">
                                <Button size="sm" onClick={handleSaveMemo}>保存</Button>
                                <Button size="sm" variant="ghost" onClick={() => { setEditingMemo(false); setMemo(user.memo || ''); }}>
                                    キャンセル
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={() => setEditingMemo(true)}
                            className="p-2 bg-gray-50 rounded-lg text-sm text-gray-600 cursor-pointer hover:bg-gray-100 min-h-[60px]"
                        >
                            {user.memo || 'クリックしてメモを追加...'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
