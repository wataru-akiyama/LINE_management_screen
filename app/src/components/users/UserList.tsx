import type { User } from '../../types';
import { PlanBadge } from '../common/PlanBadge';
import { TagBadge } from '../common/TagBadge';
import { UnreadBadge } from '../common/UnreadBadge';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

interface UserListProps {
    users: User[];
    isLoading: boolean;
    onUserClick: (user: User) => void;
}



export function UserList({ users, isLoading, onUserClick }: UserListProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl card-shadow overflow-hidden">
                <div className="animate-pulse">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-gray-200" />
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-1/3" />
                            </div>
                            <div className="h-6 bg-gray-200 rounded w-16" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="bg-white rounded-xl card-shadow p-8 text-center">
                <p className="text-gray-500">ユーザーが見つかりません</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl card-shadow overflow-hidden">
            {/* テーブルヘッダー */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
                <div className="col-span-1">未読</div>
                <div className="col-span-2">ユーザー</div>
                <div className="col-span-2">チーム</div>
                <div className="col-span-2">学年・地域</div>
                <div className="col-span-2">タグ</div>
                <div className="col-span-2">登録日</div>
                <div className="col-span-1">プラン</div>
            </div>

            {/* ユーザー行 */}
            {users.map((user) => (
                <div
                    key={user.userId}
                    onClick={() => onUserClick(user)}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                    {/* 未読バッジ */}
                    <div className="hidden md:flex col-span-1 items-center">
                        <UnreadBadge count={user.unreadCount || 0} size="sm" />
                    </div>

                    {/* ユーザー名 */}
                    <div className="col-span-2 flex items-center gap-2">
                        {user.hasUnreadMessages && (
                            <span className="flex h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate md:hidden">{user.teamName}</p>
                        </div>
                    </div>

                    {/* チーム */}
                    <div className="hidden md:flex col-span-2 items-center">
                        <p className="text-sm text-gray-600 truncate">{user.teamName}</p>
                    </div>

                    {/* 学年・地域 */}
                    <div className="col-span-2 flex items-center gap-1">
                        <TagBadge tag={user.grade} variant="grade" size="sm" />
                        <TagBadge tag={user.region} variant="region" size="sm" />
                    </div>

                    {/* タグ */}
                    <div className="hidden md:flex col-span-2 items-center gap-1 flex-wrap">
                        {user.diagnosis && (
                            <TagBadge tag={user.diagnosis.type} variant="diagnosis" size="sm" />
                        )}
                        {Array.isArray(user.customTags) && user.customTags.slice(0, 1).map((tag) => (
                            <TagBadge key={tag} tag={tag} variant="custom" size="sm" />
                        ))}
                        {Array.isArray(user.customTags) && user.customTags.length > 1 && (
                            <span className="text-xs text-gray-400">+{user.customTags.length - 1}</span>
                        )}
                    </div>

                    {/* 登録日 */}
                    <div className="hidden md:flex col-span-2 items-center">
                        <p className="text-sm text-gray-500">
                            {user.registeredAt ? format(parseISO(user.registeredAt), 'yyyy/M/d', { locale: ja }) : '-'}
                        </p>
                    </div>

                    {/* プラン */}
                    <div className="col-span-1 flex items-center justify-end md:justify-start">
                        <PlanBadge plan={user.plan} size="sm" />
                    </div>
                </div>
            ))}
        </div>
    );
}
