import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { getRichMenus, deleteRichMenu, publishRichMenu, unpublishRichMenu } from '../api/richmenus';
import { useStore } from '../store/useStore';
import type { RichMenu } from '../types';

const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const SettingsIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const UploadIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

function StatusBadge({ status }: { status: RichMenu['status'] }) {
    const styles = {
        draft: 'bg-gray-100 text-gray-800',
        active: 'bg-green-100 text-green-800',
        archived: 'bg-yellow-100 text-yellow-800'
    };

    const labels = {
        draft: '下書き',
        active: '公開中',
        archived: 'アーカイブ'
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}

function RichMenuCard({
    menu,
    onDelete,
    onPublish,
    onUnpublish,
    isPublishing
}: {
    menu: RichMenu;
    onDelete: () => void;
    onPublish: () => void;
    onUnpublish: () => void;
    isPublishing: boolean;
}) {
    return (
        <Card className="overflow-hidden">
            {/* プレビュー画像 */}
            <div className="aspect-[2500/1686] bg-gray-100 relative">
                {menu.imageFileId ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                        <div className="text-center text-primary-600">
                            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm block mt-1 font-medium">画像設定済み</span>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <UploadIcon />
                            <span className="text-sm block mt-1">画像未設定</span>
                        </div>
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <StatusBadge status={menu.status} />
                </div>
            </div>

            {/* メニュー情報 */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{menu.name || '無題のメニュー'}</h3>
                <p className="text-sm text-gray-500 mb-3">
                    メニューバー: {menu.chatBarText || 'メニュー'}
                </p>
                <p className="text-xs text-gray-400 mb-4">
                    作成日: {menu.createdAt ? new Date(menu.createdAt).toLocaleDateString('ja-JP') : '-'}
                </p>

                {/* アクションボタン */}
                <div className="flex gap-2">
                    <Link to={`/richmenus/${menu.id}`} className="flex-1">
                        <Button variant="secondary" size="sm" className="w-full">
                            編集
                        </Button>
                    </Link>
                    {menu.status === 'draft' && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={onPublish}
                            disabled={isPublishing}
                        >
                            {isPublishing ? '公開中...' : '公開'}
                        </Button>
                    )}
                    {menu.status === 'active' && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={onUnpublish}
                            disabled={isPublishing}
                            className="text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                        >
                            {isPublishing ? '処理中...' : '公開解除'}
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDelete}
                        className="text-red-500 hover:bg-red-50"
                    >
                        <TrashIcon />
                    </Button>
                </div>
            </div>
        </Card>
    );
}

export function RichMenus() {
    const { addNotification } = useStore();
    const [menus, setMenus] = useState<RichMenu[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [publishingId, setPublishingId] = useState<string | null>(null);

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        setIsLoading(true);
        try {
            const data = await getRichMenus();
            setMenus(data.menus);
        } catch (error) {
            console.error('Error fetching menus:', error);
            addNotification('メニューの取得に失敗しました', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('このリッチメニューを削除しますか？')) return;

        try {
            const result = await deleteRichMenu(id);
            if (result.success) {
                setMenus(menus.filter(m => m.id !== id));
                addNotification('リッチメニューを削除しました', 'success');
            } else {
                addNotification('削除に失敗しました', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            addNotification('削除中にエラーが発生しました', 'error');
        }
    };

    const handlePublish = async (id: string) => {
        setPublishingId(id);
        try {
            const result = await publishRichMenu(id);
            console.log('publishRichMenu result:', result);
            if (result.success) {
                await fetchMenus();
                addNotification('リッチメニューを公開しました', 'success');
            } else {
                console.error('Publish failed:', result.error);
                addNotification('公開に失敗しました', 'error');
            }
        } catch (error) {
            console.error('Publish error:', error);
            addNotification('公開中にエラーが発生しました', 'error');
        } finally {
            setPublishingId(null);
        }
    };

    const handleUnpublish = async (id: string) => {
        setPublishingId(id);
        try {
            const result = await unpublishRichMenu(id);
            if (result.success) {
                await fetchMenus();
                addNotification('リッチメニューを公開解除しました', 'success');
            } else {
                addNotification('公開解除に失敗しました', 'error');
            }
        } catch (error) {
            console.error('Unpublish error:', error);
            addNotification('処理中にエラーが発生しました', 'error');
        } finally {
            setPublishingId(null);
        }
    };

    return (
        <div className="p-4 md:p-6">
            {/* ヘッダー */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">リッチメニュー管理</h1>
                    <p className="text-gray-500 mt-1">LINEに表示するリッチメニューを管理できます</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/richmenus/plans">
                        <Button variant="secondary">
                            <SettingsIcon />
                            <span className="ml-2">プラン設定</span>
                        </Button>
                    </Link>
                    <Link to="/richmenus/new">
                        <Button variant="primary">
                            <PlusIcon />
                            <span className="ml-2">新規作成</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* メニュー一覧 */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <div className="aspect-[2500/1686] bg-gray-200" />
                            <div className="p-4">
                                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-gray-200 rounded w-1/2" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : menus.length === 0 ? (
                <Card className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">リッチメニューがありません</h3>
                    <p className="text-gray-500 mb-4">新しいリッチメニューを作成して、LINEに表示しましょう</p>
                    <Link to="/richmenus/new">
                        <Button variant="primary">
                            <PlusIcon />
                            <span className="ml-2">新規作成</span>
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menus.map((menu) => (
                        <RichMenuCard
                            key={menu.id}
                            menu={menu}
                            onDelete={() => handleDelete(menu.id)}
                            onPublish={() => handlePublish(menu.id)}
                            onUnpublish={() => handleUnpublish(menu.id)}
                            isPublishing={publishingId === menu.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
