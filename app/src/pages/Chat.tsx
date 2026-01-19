import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatWindow } from '../components/chat/ChatWindow';
import { ChatSidePanel } from '../components/chat/ChatSidePanel';
import { MessageInput } from '../components/chat/MessageInput';
import { PlanBadge } from '../components/common/PlanBadge';
import { Button } from '../components/common/Button';
import { getUser } from '../api/users';
import { getMessages, sendMessage } from '../api/messages';
import { useStore } from '../store/useStore';
import type { User, Message } from '../types';

const BackIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const InfoIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export function Chat() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { addNotification } = useStore();
    const [user, setUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

    // データ取得
    useEffect(() => {
        if (userId) {
            fetchData();
        }
    }, [userId]);

    // ポーリング（5秒間隔）
    useEffect(() => {
        if (!userId) return;

        const interval = setInterval(() => {
            fetchMessages();
        }, 5000);

        return () => clearInterval(interval);
    }, [userId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [userData, messagesData] = await Promise.all([
                getUser(userId!),
                getMessages(userId!),
            ]);
            setUser(userData);
            setMessages(messagesData.messages);
        } catch (error) {
            console.error('データ取得エラー:', error);
            addNotification('データの取得に失敗しました', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async () => {
        try {
            const data = await getMessages(userId!);
            setMessages(data.messages);
        } catch (error) {
            console.error('メッセージ取得エラー:', error);
        }
    };

    const handleSendMessage = async (content: string) => {
        if (!userId) return;

        setIsSending(true);
        try {
            const result = await sendMessage(userId, content);
            if (result.success && result.data) {
                setMessages([...messages, result.data]);
                addNotification('メッセージを送信しました', 'success');
            } else {
                addNotification('送信に失敗しました', 'error');
            }
        } catch (error) {
            console.error('送信エラー:', error);
            addNotification('送信中にエラーが発生しました', 'error');
        } finally {
            setIsSending(false);
        }
    };



    const handleUserUpdate = (updatedUser: User) => {
        setUser(updatedUser);
    };

    const handleBack = () => {
        navigate('/users');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">ユーザーが見つかりません</h2>
                    <Button onClick={handleBack}>戻る</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col">
            {/* ヘッダー */}
            <header className="sticky top-0 z-30 bg-white border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between h-16 px-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBack}
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            <BackIcon />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">{user.name}</span>
                                    <PlanBadge plan={user.plan} size="sm" />
                                </div>
                                <p className="text-sm text-gray-500">{user.teamName} • {user.grade}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${isSidePanelOpen
                                ? 'bg-primary-100 text-primary-600'
                                : 'text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            <InfoIcon />
                        </button>
                    </div>
                </div>
            </header>

            {/* メインコンテンツ */}
            <div className="flex-1 flex overflow-hidden">
                {/* チャットエリア */}
                <div className="flex-1 flex flex-col">
                    <ChatWindow messages={messages} isLoading={isLoading} />
                    <MessageInput onSend={handleSendMessage} isLoading={isSending} />
                </div>

                {/* サイドパネル */}
                <ChatSidePanel
                    user={user}
                    isOpen={isSidePanelOpen}
                    onClose={() => setIsSidePanelOpen(false)}
                    onUserUpdate={handleUserUpdate}
                />
            </div>
        </div>
    );
}
