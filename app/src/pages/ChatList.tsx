import { useState, useEffect } from 'react';
import { ChatWindow } from '../components/chat/ChatWindow';
import { ChatSidePanel } from '../components/chat/ChatSidePanel';
import { MessageInput } from '../components/chat/MessageInput';
import { UnreadBadge } from '../components/common/UnreadBadge';
import { getUsers } from '../api/users';
import { getMessages, sendMessage, resetUnreadCount } from '../api/messages';
import { useStore } from '../store/useStore';
import type { User, Message } from '../types';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

const SearchIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

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

interface UserWithLastMessage extends User {
    lastMessage?: string;
    lastMessageAt?: string;
}

export function ChatList() {
    const { addNotification } = useStore();
    const [users, setUsers] = useState<UserWithLastMessage[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [search, setSearch] = useState('');
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

    // ユーザー一覧取得
    useEffect(() => {
        fetchUsers();
    }, []);

    // メッセージポーリング
    useEffect(() => {
        if (!selectedUser) return;

        const interval = setInterval(() => {
            fetchMessages(selectedUser.userId);
        }, 5000);

        return () => clearInterval(interval);
    }, [selectedUser?.userId]);

    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const data = await getUsers({ limit: 100 });
            const sortedUsers = data.users.sort((a, b) => {
                const dateA = new Date(a.updatedAt || 0);
                const dateB = new Date(b.updatedAt || 0);
                return dateB.getTime() - dateA.getTime();
            });
            setUsers(sortedUsers);
        } catch (error) {
            console.error('ユーザー取得エラー:', error);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const fetchMessages = async (userId: string) => {
        try {
            const data = await getMessages(userId);
            setMessages(data.messages);
        } catch (error) {
            console.error('メッセージ取得エラー:', error);
        }
    };

    const handleSelectUser = async (user: User) => {
        setSelectedUser(user);
        setIsLoadingMessages(true);
        setIsSidePanelOpen(false);

        // 未読リセット（API呼び出しとローカルstate更新）
        if (user.unreadCount && user.unreadCount > 0) {
            resetUnreadCount(user.userId);
            setUsers(users.map(u => u.userId === user.userId ? { ...u, unreadCount: 0, hasUnreadMessages: false } : u));
        }

        try {
            await fetchMessages(user.userId);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const handleBack = () => {
        setSelectedUser(null);
        setIsSidePanelOpen(false);
    };

    const handleSendMessage = async (content: string) => {
        if (!selectedUser) return;

        setIsSending(true);
        try {
            const result = await sendMessage(selectedUser.userId, content);
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
        setSelectedUser(updatedUser);
        setUsers(users.map(u => u.userId === updatedUser.userId ? { ...u, ...updatedUser } : u));
    };

    const filteredUsers = users.filter(user => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            user.name.toLowerCase().includes(searchLower) ||
            user.teamName.toLowerCase().includes(searchLower)
        );
    });

    // スマホ: ユーザーリスト
    const renderUserList = () => (
        <div className="flex-1 overflow-y-auto">
            {isLoadingUsers ? (
                <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse flex gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full" />
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                    友だちが見つかりません
                </div>
            ) : (
                filteredUsers.map(user => (
                    <button
                        key={user.userId}
                        onClick={() => handleSelectUser(user)}
                        className={`w-full p-3 flex items-start gap-2 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 ${selectedUser?.userId === user.userId ? 'bg-primary-50' : ''}`}
                    >
                        {/* 未読赤丸は削除（バッジで表示するため） */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-gray-900 truncate">{user.name}</span>
                                <UnreadBadge count={user.unreadCount || 0} size="sm" />
                            </div>
                            <p className="text-sm text-gray-500 truncate">{user.teamName}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {user.updatedAt ? format(parseISO(user.updatedAt), 'M/d HH:mm', { locale: ja }) : ''}
                            </p>
                        </div>
                    </button>
                ))
            )}
        </div>
    );

    // スマホ: チャット画面
    const renderMobileChat = () => (
        <div className="flex flex-col h-full">
            {/* ヘッダー */}
            <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-2 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleBack}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                    >
                        <BackIcon />
                    </button>
                    <div>
                        <h2 className="font-medium text-gray-900 text-sm">{selectedUser!.name}</h2>
                        <p className="text-xs text-gray-500">{selectedUser!.teamName}</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                    className={`p-2 rounded-lg transition-colors ${isSidePanelOpen ? 'bg-primary-100 text-primary-600' : 'text-gray-500'
                        }`}
                >
                    <InfoIcon />
                </button>
            </div>

            {/* チャット */}
            <ChatWindow messages={messages} isLoading={isLoadingMessages} />
            <MessageInput onSend={handleSendMessage} isLoading={isSending} />
        </div>
    );

    return (
        <>
            {/* スマホ表示 */}
            <div className="md:hidden h-[calc(100vh-64px)] flex flex-col bg-white">
                {selectedUser ? (
                    renderMobileChat()
                ) : (
                    <>
                        {/* 検索ヘッダー */}
                        <div className="p-3 border-b border-gray-200 flex-shrink-0">
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                    <SearchIcon />
                                </div>
                                <input
                                    type="text"
                                    placeholder="友だちを検索..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                />
                            </div>
                        </div>
                        {renderUserList()}
                    </>
                )}
            </div>

            {/* PC表示 */}
            <div className="hidden md:flex h-[calc(100vh-64px)]">
                {/* 左: ユーザーリスト */}
                <div className="w-80 border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
                    <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <SearchIcon />
                            </div>
                            <input
                                type="text"
                                placeholder="友だちを検索..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            />
                        </div>
                    </div>
                    {renderUserList()}
                </div>

                {/* 中央: チャット */}
                <div className="flex-1 flex flex-col bg-gray-50">
                    {selectedUser ? (
                        <>
                            <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
                                <div>
                                    <h2 className="font-semibold text-gray-900">{selectedUser.name}</h2>
                                    <p className="text-sm text-gray-500">{selectedUser.teamName} • {selectedUser.grade}</p>
                                </div>
                                <button
                                    onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                                    className={`p-2 rounded-lg transition-colors ${isSidePanelOpen ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    <InfoIcon />
                                </button>
                            </div>
                            <ChatWindow messages={messages} isLoading={isLoadingMessages} />
                            <MessageInput onSend={handleSendMessage} isLoading={isSending} />
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p className="text-lg font-medium">友だちを選択してください</p>
                                <p className="text-sm">左のリストから友だちを選んでチャットを開始</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 右: サイドパネル */}
                {selectedUser && (
                    <ChatSidePanel
                        user={selectedUser}
                        isOpen={isSidePanelOpen}
                        onClose={() => setIsSidePanelOpen(false)}
                        onUserUpdate={handleUserUpdate}
                    />
                )}
            </div>

            {/* スマホ: サイドパネル（オーバーレイ） */}
            {selectedUser && isSidePanelOpen && (
                <div className="md:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidePanelOpen(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl">
                        <ChatSidePanel
                            user={selectedUser}
                            isOpen={true}
                            onClose={() => setIsSidePanelOpen(false)}
                            onUserUpdate={handleUserUpdate}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
