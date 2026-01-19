import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { getRichMenu, createRichMenu, updateRichMenu, uploadRichMenuImage, getRichMenuImage } from '../api/richmenus';
import { useStore } from '../store/useStore';
import type { RichMenu, RichMenuArea, RichMenuAction } from '../types';

// レイアウトテンプレート定義
const LAYOUT_TEMPLATES = {
    A: {
        name: '6分割',
        description: '上段3つ + 下段3つ',
        areas: [
            { x: 0, y: 0, width: 833, height: 843 },
            { x: 833, y: 0, width: 834, height: 843 },
            { x: 1667, y: 0, width: 833, height: 843 },
            { x: 0, y: 843, width: 833, height: 843 },
            { x: 833, y: 843, width: 834, height: 843 },
            { x: 1667, y: 843, width: 833, height: 843 },
        ]
    },
    B: {
        name: '4分割',
        description: '上段2つ + 下段2つ',
        areas: [
            { x: 0, y: 0, width: 1250, height: 843 },
            { x: 1250, y: 0, width: 1250, height: 843 },
            { x: 0, y: 843, width: 1250, height: 843 },
            { x: 1250, y: 843, width: 1250, height: 843 },
        ]
    },
    C: {
        name: 'カスタム（5分割）',
        description: '上段2つ + 下段3つ',
        areas: [
            { x: 0, y: 0, width: 1250, height: 843 },
            { x: 1250, y: 0, width: 1250, height: 843 },
            { x: 0, y: 843, width: 833, height: 843 },
            { x: 833, y: 843, width: 834, height: 843 },
            { x: 1667, y: 843, width: 833, height: 843 },
        ]
    }
};

const BackIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

// アクション設定モーダル
function ActionEditorModal({
    isOpen,
    onClose,
    action,
    onSave,
    areaIndex
}: {
    isOpen: boolean;
    onClose: () => void;
    action: RichMenuAction;
    onSave: (action: RichMenuAction) => void;
    areaIndex: number;
}) {
    const [type, setType] = useState(action.type || 'message');
    const [label, setLabel] = useState(action.label || '');
    const [uri, setUri] = useState(action.uri || '');
    const [text, setText] = useState(action.text || '');
    const [data, setData] = useState(action.data || '');

    useEffect(() => {
        setType(action.type || 'message');
        setLabel(action.label || '');
        setUri(action.uri || '');
        setText(action.text || '');
        setData(action.data || '');
    }, [action]);

    const handleSave = () => {
        const newAction: RichMenuAction = { type, label };
        if (type === 'uri') newAction.uri = uri;
        if (type === 'message') newAction.text = text;
        if (type === 'postback') newAction.data = data;
        onSave(newAction);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`エリア ${areaIndex + 1} のアクション設定`}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        アクションタイプ
                    </label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as 'uri' | 'message' | 'postback')}
                        className="w-full bg-white px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="uri">URL遷移</option>
                        <option value="message">テキスト送信</option>
                        <option value="postback">Postback</option>
                    </select>
                </div>

                <Input
                    label="ラベル（説明用）"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="例: トップページ"
                />

                {type === 'uri' && (
                    <Input
                        label="URL"
                        value={uri}
                        onChange={(e) => setUri(e.target.value)}
                        placeholder="https://example.com"
                    />
                )}

                {type === 'message' && (
                    <Input
                        label="送信テキスト"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="例: こんにちは"
                    />
                )}

                {type === 'postback' && (
                    <Input
                        label="Postbackデータ"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        placeholder="例: action=menu&item=1"
                    />
                )}

                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="secondary" onClick={onClose}>
                        キャンセル
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        保存
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

// メニュープレビュー
function MenuPreview({
    layout,
    areas,
    onAreaClick,
    previewImageUrl
}: {
    layout: 'A' | 'B' | 'C';
    areas: RichMenuArea[];
    onAreaClick: (index: number) => void;
    previewImageUrl?: string;
}) {
    const template = LAYOUT_TEMPLATES[layout];

    return (
        <div
            className="relative w-full aspect-[2500/1686] bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300"
            style={previewImageUrl ? {
                backgroundImage: `url(${previewImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            } : undefined}
        >
            {template.areas.map((templateArea, index) => {
                const area = areas[index];
                const left = (templateArea.x / 2500) * 100;
                const top = (templateArea.y / 1686) * 100;
                const width = (templateArea.width / 2500) * 100;
                const height = (templateArea.height / 1686) * 100;

                return (
                    <button
                        key={index}
                        onClick={() => onAreaClick(index)}
                        className={`absolute border hover:border-primary-500 transition-colors flex flex-col items-center justify-center text-xs p-1 ${previewImageUrl
                            ? 'border-white/50 bg-black/20 hover:bg-black/30 text-white'
                            : 'border-gray-400 bg-white/80 hover:bg-primary-50 text-gray-700'
                            }`}
                        style={{
                            left: `${left}%`,
                            top: `${top}%`,
                            width: `${width}%`,
                            height: `${height}%`,
                        }}
                    >
                        <span className={`font-medium ${previewImageUrl ? 'text-white drop-shadow' : 'text-gray-700'}`}>エリア {index + 1}</span>
                        {area?.action?.label && (
                            <span className={`truncate max-w-full ${previewImageUrl ? 'text-white/80 drop-shadow' : 'text-gray-500'}`}>
                                {area.action.label}
                            </span>
                        )}
                        {area?.action?.type && (
                            <span className={`text-[10px] px-1 py-0.5 rounded mt-1 ${area.action.type === 'uri' ? 'bg-blue-100 text-blue-700' :
                                area.action.type === 'message' ? 'bg-green-100 text-green-700' :
                                    'bg-purple-100 text-purple-700'
                                }`}>
                                {area.action.type === 'uri' ? 'URL' :
                                    area.action.type === 'message' ? 'テキスト' : 'Postback'}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

// 画像アップロードコンポーネント
function ImageUpload({
    previewUrl,
    onImageSelect,
    onRemove
}: {
    previewUrl?: string;
    onImageSelect: (file: File) => void;
    onRemove: () => void;
}) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImageSelect(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            onImageSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">メニュー画像</label>
            {previewUrl ? (
                <div className="relative">
                    <img
                        src={previewUrl}
                        alt="プレビュー"
                        className="w-full aspect-[2500/1686] object-cover rounded-lg border border-gray-200"
                    />
                    <button
                        type="button"
                        onClick={onRemove}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                        <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-600">クリックまたはドラッグ&ドロップで画像をアップロード</p>
                        <p className="text-xs text-gray-400 mt-1">推奨サイズ: 2500×1686px</p>
                    </label>
                </div>
            )}
        </div>
    );
}

export function RichMenuEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addNotification } = useStore();

    const isNew = !id || id === 'new';

    const [isLoading, setIsLoading] = useState(!isNew);
    const [isSaving, setIsSaving] = useState(false);

    // フォーム状態
    const [name, setName] = useState('');
    const [chatBarText, setChatBarText] = useState('メニュー');
    const [layout, setLayout] = useState<'A' | 'B' | 'C'>('A');
    const [imageFileId, setImageFileId] = useState('');
    const [previewImageUrl, setPreviewImageUrl] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [areas, setAreas] = useState<RichMenuArea[]>([]);

    // モーダル状態
    const [editingAreaIndex, setEditingAreaIndex] = useState<number | null>(null);

    // 既存メニューの読み込み
    useEffect(() => {
        if (!isNew && id) {
            loadMenu();
        } else {
            // 新規作成時はデフォルトエリアを設定
            initializeAreas('A');
        }
    }, [id]);

    const loadMenu = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const menu = await getRichMenu(id);
            if (menu) {
                setName(menu.name);
                setChatBarText(menu.chatBarText);
                setLayout(menu.layout);
                setImageFileId(menu.imageFileId || '');
                // 既存画像がある場合はプレビューを取得
                if (menu.imageFileId) {
                    // img_で始まるIDはスプレッドシート保存の画像
                    if (menu.imageFileId.startsWith('img_')) {
                        const imageData = await getRichMenuImage(menu.imageFileId);
                        if (imageData) {
                            setPreviewImageUrl(imageData.url);
                        }
                    } else {
                        // 古い形式（Google Drive ID）
                        setPreviewImageUrl(`https://drive.google.com/uc?export=view&id=${menu.imageFileId}`);
                    }
                }
                setAreas(menu.areas || []);
            }
        } catch (error) {
            console.error('Load error:', error);
            addNotification('メニューの読み込みに失敗しました', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const initializeAreas = (newLayout: 'A' | 'B' | 'C') => {
        const template = LAYOUT_TEMPLATES[newLayout];
        const newAreas: RichMenuArea[] = template.areas.map(a => ({
            ...a,
            action: { type: 'message' as const, label: '', text: '' }
        }));
        setAreas(newAreas);
    };

    const handleLayoutChange = (newLayout: 'A' | 'B' | 'C') => {
        setLayout(newLayout);
        initializeAreas(newLayout);
    };

    const handleAreaClick = (index: number) => {
        setEditingAreaIndex(index);
    };

    const handleActionSave = (action: RichMenuAction) => {
        if (editingAreaIndex === null) return;

        const newAreas = [...areas];
        newAreas[editingAreaIndex] = {
            ...newAreas[editingAreaIndex],
            action
        };
        setAreas(newAreas);
    };

    const handleImageSelect = (file: File) => {
        setImageFile(file);
        // ローカルプレビュー用にData URLを作成
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewImageUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleImageRemove = () => {
        setImageFile(null);
        setPreviewImageUrl('');
        setImageFileId('');
    };

    const handleSave = async () => {
        if (!name.trim()) {
            addNotification('メニュー名を入力してください', 'error');
            return;
        }

        setIsSaving(true);
        try {
            let uploadedImageFileId = imageFileId;

            // 新しい画像が選択されている場合はアップロード
            if (imageFile) {
                addNotification('画像をアップロード中...', 'info');
                const uploadResult = await uploadRichMenuImage(isNew ? null : id!, imageFile);
                if (uploadResult.success && uploadResult.data) {
                    uploadedImageFileId = uploadResult.data.fileId;
                } else {
                    addNotification('画像のアップロードに失敗しました', 'error');
                    setIsSaving(false);
                    return;
                }
            }

            const menuData: Partial<RichMenu> = {
                name,
                chatBarText,
                layout,
                imageFileId: uploadedImageFileId,
                areas
            };

            let result;
            if (isNew) {
                result = await createRichMenu(menuData);
            } else {
                result = await updateRichMenu(id!, menuData);
            }

            if (result.success) {
                addNotification(isNew ? 'メニューを作成しました' : 'メニューを更新しました', 'success');
                navigate('/richmenus');
            } else {
                addNotification('保存に失敗しました', 'error');
            }
        } catch (error) {
            console.error('Save error:', error);
            addNotification('保存中にエラーが発生しました', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-4 md:p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
                    <div className="h-64 bg-gray-200 rounded mb-4" />
                    <div className="h-10 bg-gray-200 rounded w-1/2" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            {/* ヘッダー */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/richmenus')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <BackIcon />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isNew ? '新規リッチメニュー作成' : 'リッチメニュー編集'}
                    </h1>
                </div>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? '保存中...' : '保存'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 左側: 設定フォーム */}
                <div className="space-y-6">
                    <Card className="p-4">
                        <h2 className="font-semibold text-gray-900 mb-4">基本設定</h2>
                        <div className="space-y-4">
                            <Input
                                label="メニュー名"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="例: フリープラン用メニュー"
                                required
                            />
                            <Input
                                label="メニューバーテキスト"
                                value={chatBarText}
                                onChange={(e) => setChatBarText(e.target.value)}
                                placeholder="例: メニュー"
                            />
                            <ImageUpload
                                previewUrl={previewImageUrl}
                                onImageSelect={handleImageSelect}
                                onRemove={handleImageRemove}
                            />
                        </div>
                    </Card>

                    <Card className="p-4">
                        <h2 className="font-semibold text-gray-900 mb-4">レイアウト選択</h2>
                        <div className="grid grid-cols-3 gap-3">
                            {(Object.keys(LAYOUT_TEMPLATES) as Array<'A' | 'B' | 'C'>).map((key) => (
                                <button
                                    key={key}
                                    onClick={() => handleLayoutChange(key)}
                                    className={`p-3 border-2 rounded-lg text-center transition-colors ${layout === key
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="font-medium text-gray-900">
                                        {LAYOUT_TEMPLATES[key].name}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {LAYOUT_TEMPLATES[key].description}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* 右側: プレビュー */}
                <div>
                    <Card className="p-4">
                        <h2 className="font-semibold text-gray-900 mb-4">
                            プレビュー
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                （クリックでアクション設定）
                            </span>
                        </h2>
                        <MenuPreview
                            layout={layout}
                            areas={areas}
                            onAreaClick={handleAreaClick}
                            previewImageUrl={previewImageUrl}
                        />
                    </Card>
                </div>
            </div>

            {/* アクション設定モーダル */}
            {editingAreaIndex !== null && (
                <ActionEditorModal
                    isOpen={editingAreaIndex !== null}
                    onClose={() => setEditingAreaIndex(null)}
                    action={areas[editingAreaIndex]?.action || { type: 'message' }}
                    onSave={handleActionSave}
                    areaIndex={editingAreaIndex}
                />
            )}
        </div>
    );
}
