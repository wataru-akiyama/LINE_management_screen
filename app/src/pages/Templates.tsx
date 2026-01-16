import { useState, useEffect } from 'react';
import { Button } from '../components/common/Button';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../api/templates';
import { useStore } from '../store/useStore';
import type { Template } from '../types';

const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const EditIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

interface TemplateFormData {
    name: string;
    content: string;
    category: string;
}

export function Templates() {
    const { addNotification } = useStore();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [formData, setFormData] = useState<TemplateFormData>({
        name: '',
        content: '',
        category: '未分類'
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const data = await getTemplates();
            setTemplates(data.templates);
        } catch (error) {
            console.error('テンプレート取得エラー:', error);
            addNotification('テンプレートの取得に失敗しました', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingTemplate(null);
        setFormData({ name: '', content: '', category: '未分類' });
        setIsEditing(true);
    };

    const handleEdit = (template: Template) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name,
            content: template.content,
            category: template.category
        });
        setIsEditing(true);
    };

    const handleDelete = async (templateId: string) => {
        if (!confirm('このテンプレートを削除しますか？')) return;

        const result = await deleteTemplate(templateId);
        if (result.success) {
            setTemplates(templates.filter(t => t.templateId !== templateId));
            addNotification('テンプレートを削除しました', 'success');
        } else {
            addNotification('削除に失敗しました', 'error');
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            addNotification('テンプレート名を入力してください', 'error');
            return;
        }
        if (!formData.content.trim()) {
            addNotification('テンプレート内容を入力してください', 'error');
            return;
        }

        if (editingTemplate) {
            // 更新
            const result = await updateTemplate(editingTemplate.templateId, formData);
            if (result.success) {
                await fetchTemplates();
                addNotification('テンプレートを更新しました', 'success');
                setIsEditing(false);
            } else {
                addNotification('更新に失敗しました', 'error');
            }
        } else {
            // 新規作成
            const result = await createTemplate(formData);
            if (result.success) {
                await fetchTemplates();
                addNotification('テンプレートを作成しました', 'success');
                setIsEditing(false);
            } else {
                addNotification('作成に失敗しました', 'error');
            }
        }
    };

    const categoryColors: Record<string, string> = {
        '未分類': 'bg-gray-100 text-gray-700',
        'あいさつ': 'bg-blue-100 text-blue-700',
        'お礼': 'bg-green-100 text-green-700',
        '案内': 'bg-yellow-100 text-yellow-700',
        'フォロー': 'bg-purple-100 text-purple-700'
    };

    return (
        <div className="p-6">
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">テンプレート</h1>
                    <p className="text-gray-500 mt-1">メッセージテンプレートの管理</p>
                </div>
                <Button onClick={handleCreate}>
                    <PlusIcon />
                    新規作成
                </Button>
            </div>

            {/* テンプレート一覧 */}
            {isLoading ? (
                <div className="bg-white rounded-xl card-shadow p-8">
                    <div className="animate-pulse space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-20 bg-gray-200 rounded" />
                        ))}
                    </div>
                </div>
            ) : templates.length === 0 ? (
                <div className="bg-white rounded-xl card-shadow p-8 text-center">
                    <p className="text-gray-500 mb-4">テンプレートがありません</p>
                    <Button onClick={handleCreate}>最初のテンプレートを作成</Button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                        <div
                            key={template.templateId}
                            className="bg-white rounded-xl card-shadow p-4 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[template.category] || categoryColors['未分類']}`}>
                                    {template.category}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                                {template.content}
                            </p>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => handleEdit(template)}
                                    className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                >
                                    <EditIcon />
                                </button>
                                <button
                                    onClick={() => handleDelete(template.templateId)}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 編集モーダル */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl w-full max-w-lg m-4">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {editingTemplate ? 'テンプレートを編集' : 'テンプレートを作成'}
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    テンプレート名
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="例: あいさつメッセージ"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    カテゴリ
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="未分類">未分類</option>
                                    <option value="あいさつ">あいさつ</option>
                                    <option value="お礼">お礼</option>
                                    <option value="案内">案内</option>
                                    <option value="フォロー">フォロー</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    メッセージ内容
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                    placeholder="テンプレートの内容を入力..."
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setIsEditing(false)}>
                                キャンセル
                            </Button>
                            <Button onClick={handleSave}>
                                {editingTemplate ? '更新' : '作成'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
