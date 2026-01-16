import { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { getTemplates } from '../../api/templates';
import type { Template } from '../../types';

interface TemplateSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (content: string) => void;
}

const SearchIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export function TemplateSelector({ isOpen, onClose, onSelect }: TemplateSelectorProps) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
        }
    }, [isOpen]);

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const data = await getTemplates();
            setTemplates(data.templates);
        } catch (error) {
            console.error('テンプレート取得エラー:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const categories = [...new Set(templates.map(t => t.category))];

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = !search ||
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.content.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !selectedCategory || t.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSelect = (template: Template) => {
        onSelect(template.content);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl m-4 max-h-[80vh] flex flex-col">
                {/* ヘッダー */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">テンプレートを選択</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-gray-100 text-gray-500"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* 検索・フィルター */}
                <div className="p-4 border-b border-gray-200 space-y-3">
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            placeholder="テンプレートを検索..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setSelectedCategory('')}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${!selectedCategory
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            すべて
                        </button>
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                                        ? 'bg-primary-100 text-primary-700'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* テンプレート一覧 */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="animate-pulse space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-16 bg-gray-200 rounded" />
                            ))}
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">テンプレートが見つかりません</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredTemplates.map(template => (
                                <button
                                    key={template.templateId}
                                    onClick={() => handleSelect(template)}
                                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-gray-900">{template.name}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                            {template.category}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2">
                                        {template.content}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* フッター */}
                <div className="p-4 border-t border-gray-200">
                    <Button variant="ghost" className="w-full" onClick={onClose}>
                        キャンセル
                    </Button>
                </div>
            </div>
        </div>
    );
}
