import type { SimilarUser } from '../../types';

interface SimilarUsersProps {
    users: SimilarUser[];
    onUserClick?: (userId: string) => void;
}

const UserIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const StarIcon = () => (
    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

function getScoreColor(score: number): string {
    if (score >= 80) return 'text-emerald-600 bg-emerald-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-amber-600 bg-amber-100';
    return 'text-gray-600 bg-gray-100';
}

function getScoreProgressColor(score: number): string {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-gray-400';
}

export function SimilarUsers({ users, onUserClick }: SimilarUsersProps) {
    if (users.length === 0) {
        return (
            <div className="text-center py-6 text-gray-500">
                類似ユーザーが見つかりませんでした
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {users.map((user) => (
                <div
                    key={user.userId}
                    className={`p-4 bg-gray-50 rounded-lg border border-gray-100 transition-all ${onUserClick
                            ? 'cursor-pointer hover:bg-gray-100 hover:border-gray-200'
                            : ''
                        }`}
                    onClick={() => onUserClick?.(user.userId)}
                >
                    <div className="flex items-start gap-3">
                        {/* アバター */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 flex-shrink-0">
                            <UserIcon />
                        </div>

                        {/* ユーザー情報 */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-gray-900 truncate">
                                    {user.name}
                                </span>
                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getScoreColor(user.matchScore)}`}>
                                    {user.matchScore}%
                                </span>
                            </div>

                            {/* マッチ度バー */}
                            <div className="h-1.5 w-full bg-gray-200 rounded-full mb-2">
                                <div
                                    className={`h-full rounded-full transition-all ${getScoreProgressColor(user.matchScore)}`}
                                    style={{ width: `${user.matchScore}%` }}
                                />
                            </div>

                            {/* マッチ理由 */}
                            <div className="flex flex-wrap gap-1 mb-2">
                                {user.matchReasons.map((reason, i) => (
                                    <span
                                        key={i}
                                        className="px-1.5 py-0.5 text-xs bg-white border border-gray-200 rounded text-gray-600"
                                    >
                                        {reason}
                                    </span>
                                ))}
                            </div>

                            {/* 診断タイプ */}
                            {user.diagnosisType && (
                                <div className="text-xs text-gray-500 mb-1">
                                    診断: {user.diagnosisType}
                                </div>
                            )}

                            {/* 成功事例 */}
                            {user.successCase && (
                                <div className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded mt-2">
                                    <StarIcon />
                                    <span className="font-medium">{user.successCase}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
