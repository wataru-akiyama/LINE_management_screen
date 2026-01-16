import type { Message } from '../../types';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isOutgoing = message.direction === 'outgoing';

    return (
        <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} mb-3`}>
            <div className={`max-w-[70%] ${isOutgoing ? 'order-2' : 'order-1'}`}>
                <div
                    className={`rounded-2xl px-4 py-2 ${isOutgoing
                        ? 'rounded-br-md'
                        : 'bg-white text-gray-900 card-shadow rounded-bl-md'
                        }`}
                    style={isOutgoing ? { backgroundColor: '#06C755', color: '#ffffff' } : undefined}
                >
                    {message.messageType === 'text' && (
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    )}
                    {message.messageType === 'image' && message.mediaUrl && (
                        <img
                            src={message.mediaUrl}
                            alt="画像"
                            className="rounded-lg max-w-full"
                        />
                    )}
                    {message.messageType === 'sticker' && (
                        <p className="text-sm">[スタンプ]</p>
                    )}
                </div>
                <div
                    className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${isOutgoing ? 'justify-end' : 'justify-start'
                        }`}
                >
                    <span>{format(parseISO(message.sentAt), 'M/d HH:mm', { locale: ja })}</span>
                    {isOutgoing && message.sentBy && (
                        <span className="text-gray-300">• {message.sentBy}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
