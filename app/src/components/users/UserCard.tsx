import type { User } from '../../types';
import { PlanBadge } from '../common/PlanBadge';
import { TagBadge } from '../common/TagBadge';

interface UserCardProps {
    user: User;
    onClick: () => void;
}

const MessageIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

export function UserCard({ user, onClick }: UserCardProps) {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl p-4 card-shadow hover:card-shadow-lg transition-all cursor-pointer group"
        >
            <div className="flex items-start gap-4">
                {/* アバター */}
                <div className="flex-shrink-0 relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold text-lg group-hover:bg-primary-200 transition-colors">
                        {user.name.charAt(0)}
                    </div>
                    {user.hasUnreadMessages && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white">
                            <MessageIcon />
                        </span>
                    )}
                </div>

                {/* ユーザー情報 */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                        <PlanBadge plan={user.plan} size="sm" />
                    </div>
                    <p className="text-sm text-gray-500 truncate">{user.teamName}</p>

                    {/* タグ */}
                    <div className="flex flex-wrap gap-1 mt-2">
                        <TagBadge tag={user.grade} variant="grade" size="sm" />
                        <TagBadge tag={user.region} variant="region" size="sm" />
                        {user.diagnosis && (
                            <TagBadge tag={user.diagnosis.type} variant="diagnosis" size="sm" />
                        )}
                    </div>

                    {/* カスタムタグ */}
                    {user.customTags && user.customTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {user.customTags.slice(0, 2).map((tag) => (
                                <TagBadge key={tag} tag={tag} variant="custom" size="sm" />
                            ))}
                            {user.customTags.length > 2 && (
                                <span className="text-xs text-gray-400">+{user.customTags.length - 2}</span>
                            )}
                        </div>
                    )}
                </div>

                {/* 矢印 */}
                <div className="flex-shrink-0 text-gray-400 group-hover:text-primary-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
