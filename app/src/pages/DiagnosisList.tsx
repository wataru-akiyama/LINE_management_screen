import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { getDiagnosisTemplates, deleteDiagnosisTemplate } from '../api/diagnosisTemplates';
import type { DiagnosisTemplate } from '../types';

// アイコンコンポーネント
const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const StatusBadge = ({ status }: { status: DiagnosisTemplate['status'] }) => {
    const styles = {
        active: 'bg-green-100 text-green-800',
        draft: 'bg-yellow-100 text-yellow-800',
        archived: 'bg-gray-100 text-gray-800',
    };
    const labels = {
        active: '公開中',
        draft: '下書き',
        archived: 'アーカイブ',
    };

    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
            {labels[status]}
        </span>
    );
};

const DiagnosisCard = ({
    template,
    onDelete,
}: {
    template: DiagnosisTemplate;
    onDelete: () => void;
}) => {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <Link
                        to={`/diagnosis/${template.id}`}
                        className="text-lg font-semibold text-gray-800 hover:text-primary-600 transition-colors"
                    >
                        {template.name || '(無題の診断)'}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                        {template.description || '説明なし'}
                    </p>
                </div>
                <StatusBadge status={template.status} />
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex gap-4">
                    <span>作成: {formatDate(template.createdAt)}</span>
                    <span>更新: {formatDate(template.updatedAt)}</span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onDelete();
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="削除"
                >
                    <TrashIcon />
                </button>
            </div>
        </Card>
    );
};

export function DiagnosisList() {
    const [templates, setTemplates] = useState<DiagnosisTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchTemplates = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getDiagnosisTemplates();
            setTemplates(result?.templates ?? []);
        } catch (err) {
            setError('診断テンプレートの取得に失敗しました');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleDeleteClick = (id: string) => {
        setDeleteTarget(id);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;

        setDeleting(true);
        try {
            const result = await deleteDiagnosisTemplate(deleteTarget);
            if (result.success) {
                setTemplates(templates.filter(t => t.id !== deleteTarget));
            } else {
                alert('削除に失敗しました');
            }
        } catch (err) {
            console.error(err);
            alert('削除に失敗しました');
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteTarget(null);
    };

    return (
        <div className="p-6">
            {/* 削除確認モーダル */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">削除の確認</h3>
                        <p className="text-gray-600 mb-6">この診断を削除しますか？この操作は取り消せません。</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleDeleteCancel}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                disabled={deleting}
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                                disabled={deleting}
                            >
                                {deleting ? '削除中...' : '削除する'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ヘッダー */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">診断管理</h1>
                    <p className="text-gray-500 mt-1">診断フローを作成・管理できます</p>
                </div>
                <Link to="/diagnosis/new">
                    <Button variant="primary" className="flex items-center gap-2">
                        <PlusIcon />
                        新規作成
                    </Button>
                </Link>
            </div>

            {/* コンテンツ */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    {error}
                    <button onClick={fetchTemplates} className="ml-4 underline">
                        再読み込み
                    </button>
                </div>
            ) : templates.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">診断がありません</h3>
                    <p className="text-gray-500 mb-4">新しい診断を作成して、ユーザーのタイプを判定しましょう</p>
                    <Link to="/diagnosis/new">
                        <Button variant="primary" className="inline-flex items-center gap-2">
                            <PlusIcon />
                            診断を作成
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {templates.map(template => (
                        <DiagnosisCard
                            key={template.id}
                            template={template}
                            onDelete={() => handleDeleteClick(template.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

