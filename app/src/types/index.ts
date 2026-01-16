// ユーザー型定義
export interface User {
    userId: string;
    name: string;
    grade: '高1' | '高2' | '高3' | '保護者' | '指導者';
    region: string;
    prefecture: string;
    teamName: string;
    plan: 'FREE' | 'BASIC';
    lineId: string;
    registeredAt: string;
    updatedAt: string;
    universities?: string[];
    diagnosis?: {
        type: string;
        completedAt: string;
    };
    customTags?: string[];
    hasUnreadMessages?: boolean;
    unreadCount?: number;  // 未読メッセージ数
    memo?: string;  // メモ
}

// メッセージ型定義
export interface Message {
    messageId: string;
    userId: string;
    direction: 'incoming' | 'outgoing';
    messageType: 'text' | 'image' | 'sticker';
    content: string;
    mediaUrl?: string;
    sentAt: string;
    sentBy?: string;
}

// 配信ログ型定義
export interface DeliveryLog {
    deliveryId: string;
    deliveryType: 'broadcast' | 'segment' | 'individual';
    targetFilter?: Record<string, string>;
    targetCount: number;
    messageContent: object;
    status: 'pending' | 'sent' | 'failed';
    scheduledAt?: string;
    sentAt?: string;
    createdBy: string;
    createdAt: string;
}

// ステップ配信設定型定義
export interface StepDeliveryConfig {
    stepId: string;
    stepName: string;
    daysAfterRegistration: number;
    targetFilter?: Record<string, string>;
    messageContent: object;
    isActive: boolean;
    createdAt: string;
}

// テンプレート型定義
export interface Template {
    templateId: string;
    name: string;
    content: string;
    category: string;
    createdAt: string;
    updatedAt: string;
}

// アンケート型定義
export interface Survey {
    surveyId: string;
    userId: string;
    surveyType: string;
    answers: Record<string, string>;
    submittedAt: string;
}

// ページネーション型定義
export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// 統計情報型定義
export interface Statistics {
    totalUsers: number;
    basicUsers: number;
    freeUsers: number;
    grade3Users: number;
    diagnosisCompleted: number;
}

// APIレスポンス型定義
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

// フィルターパラメータ型定義
export interface UserFilters {
    search?: string;
    grade?: string;
    region?: string;
    plan?: string;
    status?: string;
    page?: number;
    limit?: number;
}

// 配信フィルター型定義
export interface DeliveryFilter {
    grade?: string;
    region?: string;
    prefecture?: string;
    plan?: string;
    teamName?: string;
    diagnosisType?: string;
    customTags?: string[];
}

// 配信タイプ
export type DeliveryType = 'broadcast' | 'segment' | 'scheduled';

// 診断履歴型定義
export interface DiagnosisHistory {
    historyId: string;
    userId: string;
    diagnosisDate: string;
    resultType: string;
    resultName: string;
    answers: {
        q1: string;
        q2: string;
        q3: string;
        q4: string;
        q5: string;
        q6: string;
        q7: string;
        q8: string;
    };
    scores: Record<string, number>;
}

// 診断質問テキスト
export interface DiagnosisQuestionTexts {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    q5: string;
    q6: string;
    q7: string;
    q8: string;
}
