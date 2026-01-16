import { useState } from 'react';
import { Button } from '../common/Button';
import { TemplateSelector } from './TemplateSelector';

interface MessageInputProps {
    onSend: (content: string) => void;
    isLoading?: boolean;
    disabled?: boolean;
}

const SendIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const TemplateIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export function MessageInput({ onSend, isLoading, disabled }: MessageInputProps) {
    const [content, setContent] = useState('');
    const [isTemplateOpen, setIsTemplateOpen] = useState(false);
    const [isComposing, setIsComposing] = useState(false);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (content.trim() && !isLoading && !disabled) {
            onSend(content.trim());
            setContent('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // IME入力中は何もしない
        if (isComposing) return;

        // Ctrl+Enter または Cmd+Enter で送信
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSelectTemplate = (templateContent: string) => {
        setContent(templateContent);
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="flex gap-3 p-4 bg-white border-t border-gray-200">
                <button
                    type="button"
                    onClick={() => setIsTemplateOpen(true)}
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 border border-gray-300 transition-colors flex-shrink-0"
                    title="テンプレート"
                >
                    <TemplateIcon />
                </button>
                <div className="flex-1 relative">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        placeholder="メッセージを入力... (Ctrl+Enterで送信)"
                        disabled={disabled || isLoading}
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed bg-white text-gray-900 placeholder:text-gray-400"
                        style={{ minHeight: '60px', maxHeight: '150px' }}
                    />
                </div>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={!content.trim() || isLoading || disabled}
                    isLoading={isLoading}
                    className="self-end"
                >
                    <SendIcon />
                    <span className="ml-1 hidden sm:inline">送信</span>
                </Button>
            </form>

            <TemplateSelector
                isOpen={isTemplateOpen}
                onClose={() => setIsTemplateOpen(false)}
                onSelect={handleSelectTemplate}
            />
        </>
    );
}
