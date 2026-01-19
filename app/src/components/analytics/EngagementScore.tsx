import type { EngagementScore as EngagementScoreType } from '../../types';

interface EngagementScoreProps {
    engagement: EngagementScoreType;
}

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up') {
        return (
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        );
    }
    if (trend === 'down') {
        return (
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
        );
    }
    return (
        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>
    );
};

const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // amber
    if (score >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
};

const getScoreLabel = (score: number): string => {
    if (score >= 80) return '優秀';
    if (score >= 60) return '良好';
    if (score >= 40) return '普通';
    return '要注意';
};

const getTrendLabel = (trend: 'up' | 'down' | 'stable'): string => {
    if (trend === 'up') return '上昇中';
    if (trend === 'down') return '下降中';
    return '横ばい';
};

export function EngagementScoreDisplay({ engagement }: EngagementScoreProps) {
    const { score, trend, breakdown } = engagement;
    const color = getScoreColor(score);
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            {/* 円形プログレス */}
            <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                    {/* 背景円 */}
                    <circle
                        cx="64"
                        cy="64"
                        r="45"
                        stroke="#e5e7eb"
                        strokeWidth="10"
                        fill="none"
                    />
                    {/* プログレス円 */}
                    <circle
                        cx="64"
                        cy="64"
                        r="45"
                        stroke={color}
                        strokeWidth="10"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-700"
                    />
                </svg>

                {/* 中央のスコア表示 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold" style={{ color }}>{score}</span>
                    <span className="text-xs text-gray-500">{getScoreLabel(score)}</span>
                </div>
            </div>

            {/* トレンド */}
            <div className="flex items-center gap-1 mt-3">
                <TrendIcon trend={trend} />
                <span className="text-sm text-gray-600">{getTrendLabel(trend)}</span>
            </div>

            {/* ブレイクダウン */}
            {breakdown && (
                <div className="w-full mt-4 space-y-2">
                    <BreakdownBar label="ログイン頻度" value={breakdown.loginFrequency} />
                    <BreakdownBar label="メッセージ反応" value={breakdown.messageRate} />
                    <BreakdownBar label="コンテンツ閲覧" value={breakdown.contentEngagement} />
                </div>
            )}
        </div>
    );
}

function BreakdownBar({ label, value }: { label: string; value: number }) {
    const color = getScoreColor(value);

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-24 flex-shrink-0">{label}</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${value}%`, backgroundColor: color }}
                />
            </div>
            <span className="text-xs font-medium w-8 text-right">{value}</span>
        </div>
    );
}
