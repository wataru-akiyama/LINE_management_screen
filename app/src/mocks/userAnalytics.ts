import type { UserAnalytics, UserActivity, ActivityHeatmapData, SimilarUser } from '../types';
import { format, subDays } from 'date-fns';

// ヒートマップデータを生成（過去90日分）
function generateHeatmapData(): ActivityHeatmapData[] {
    const data: ActivityHeatmapData[] = [];
    const today = new Date();

    for (let i = 0; i < 90; i++) {
        const date = subDays(today, i);
        const count = Math.random() > 0.3 ? Math.floor(Math.random() * 8) : 0;
        const level = count === 0 ? 0 :
            count <= 2 ? 1 :
                count <= 4 ? 2 :
                    count <= 6 ? 3 : 4;

        data.push({
            date: format(date, 'yyyy-MM-dd'),
            count,
            level: level as 0 | 1 | 2 | 3 | 4
        });
    }

    return data;
}

// 類似ユーザーを生成
function generateSimilarUsers(): SimilarUser[] {
    const names = ['田中 太郎', '佐藤 花子', '鈴木 一郎', '高橋 美咲', '伊藤 健太'];
    const diagnosisTypes = ['プロ志向型', 'チャレンジ型', 'チーム成長型', '経験重視型', 'エンジョイ型'];
    const reasons = [
        ['同じ学年', '同じ地域'],
        ['同じ診断結果', '志望校が近い'],
        ['活動パターンが類似', 'プラン同じ'],
        ['同じチーム規模', '反応パターン類似'],
        ['エンゲージメントスコアが近い', '同じタグ']
    ];
    const successCases = [
        'プレミアムプラン契約',
        'イベント参加',
        undefined,
        '紹介で新規獲得',
        undefined
    ];

    return names.slice(0, 3 + Math.floor(Math.random() * 2)).map((name, i) => ({
        userId: `similar-${i + 1}`,
        name,
        matchScore: Math.floor(70 + Math.random() * 25),
        matchReasons: reasons[i],
        diagnosisType: diagnosisTypes[i],
        successCase: successCases[i]
    })).sort((a, b) => b.matchScore - a.matchScore);
}

// ユーザー分析のモックデータを生成
export function generateMockUserAnalytics(userId: string): UserAnalytics {
    // 能力値をランダムに生成（デモ用）
    const abilities = {
        engagement: Math.floor(Math.random() * 40) + 60,      // 60-100
        learningDrive: Math.floor(Math.random() * 50) + 50,   // 50-100
        responsiveness: Math.floor(Math.random() * 60) + 40,  // 40-100
        loyalty: Math.floor(Math.random() * 50) + 50,         // 50-100
        communication: Math.floor(Math.random() * 70) + 30,   // 30-100
    };

    // 活動ログを生成
    const activities: UserActivity[] = [
        {
            id: '1',
            type: 'login',
            description: 'アプリにログインしました',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
            id: '2',
            type: 'message_received',
            description: '新着メッセージを受信しました',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
            id: '3',
            type: 'message_sent',
            description: '質問を送信しました',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        },
        {
            id: '4',
            type: 'diagnosis',
            description: '診断を完了しました',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
        {
            id: '5',
            type: 'survey',
            description: 'アンケートに回答しました',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        },
        {
            id: '6',
            type: 'rich_menu',
            description: 'リッチメニューをタップしました',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        },
        {
            id: '7',
            type: 'page_view',
            description: '大学情報ページを閲覧しました',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        },
    ];

    // エンゲージメントスコア
    const avgAbility = (abilities.engagement + abilities.learningDrive + abilities.responsiveness + abilities.loyalty + abilities.communication) / 5;
    const engagement = {
        score: Math.round(avgAbility),
        trend: avgAbility > 70 ? 'up' : avgAbility > 50 ? 'stable' : 'down' as 'up' | 'down' | 'stable',
        lastUpdated: new Date().toISOString(),
        breakdown: {
            loginFrequency: Math.floor(Math.random() * 30) + 70,
            messageRate: Math.floor(Math.random() * 40) + 60,
            contentEngagement: Math.floor(Math.random() * 50) + 50,
        },
    };

    // ネクストアクション
    const nextActions = [
        {
            id: '1',
            priority: 'high' as const,
            type: 'follow_up' as const,
            title: 'フォローメッセージを送信',
            description: '最終連絡から2週間経過しています',
            reason: '長期間コンタクトがないユーザーへのフォローアップ',
        },
        {
            id: '2',
            priority: 'medium' as const,
            type: 'upsell' as const,
            title: 'プレミアムプランの案内',
            description: 'アクティブなユーザーにプランアップグレードを提案',
            reason: '高いエンゲージメントスコアを維持している',
        },
        {
            id: '3',
            priority: 'low' as const,
            type: 'check_in' as const,
            title: '志望校の更新確認',
            description: '志望校情報が3ヶ月以上更新されていません',
            reason: '定期的な情報更新の促進',
        },
    ];

    return {
        userId,
        abilities,
        activities,
        engagement,
        nextActions,
        heatmapData: generateHeatmapData(),
        similarUsers: generateSimilarUsers(),
    };
}

// 特定ユーザー向けのモックデータ（デモ用に固定値）
export const mockUserAnalyticsData: Record<string, UserAnalytics> = {};

export function getMockUserAnalytics(userId: string): UserAnalytics {
    if (!mockUserAnalyticsData[userId]) {
        mockUserAnalyticsData[userId] = generateMockUserAnalytics(userId);
    }
    return mockUserAnalyticsData[userId];
}
