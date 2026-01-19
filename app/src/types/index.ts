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

// アンケート回答型定義（データ用）
export interface UserSurveyAnswer {
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

// ==============================
// リッチメニュー関連
// ==============================

// リッチメニューアクション型
export interface RichMenuAction {
    type: 'uri' | 'message' | 'postback';
    label?: string;
    uri?: string;
    text?: string;
    data?: string;
}

// リッチメニューエリア型
export interface RichMenuArea {
    x: number;
    y: number;
    width: number;
    height: number;
    action: RichMenuAction;
}

// リッチメニュー型
export interface RichMenu {
    id: string;
    name: string;
    lineRichMenuId?: string;
    imageFileId?: string;
    layout: 'A' | 'B' | 'C';  // A: 6分割, B: 4分割, C: カスタム
    areas: RichMenuArea[];
    chatBarText: string;
    status: 'active' | 'draft';
    createdAt: string;
    updatedAt: string;
}

// プラン別メニュー設定型
export interface RichMenuPlanMapping {
    plan: string;
    richMenuId: string;
}

// ==============================
// 診断テンプレート関連
// ==============================

// 診断テンプレート
export interface DiagnosisTemplate {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'draft' | 'archived';
    createdAt: string;
    updatedAt: string;
    questions?: DiagnosisQuestion[];
    resultTypes?: DiagnosisResultType[];
}

// 診断質問
export interface DiagnosisQuestion {
    questionId: string;
    diagnosisId?: string;
    order: number;
    type: 'single' | 'multiple' | 'text' | 'date' | 'region';
    text: string;
    options: DiagnosisOption[];
    scores: Record<string, Record<string, number>>; // { optionId: { typeId: score } }
    condition?: DiagnosisCondition | null;
}

// 質問選択肢
export interface DiagnosisOption {
    id: string;
    text: string;
}

// 条件分岐
export interface DiagnosisCondition {
    triggerValue: string;
    skipTo?: string;
    endDiagnosis?: boolean;
}

// 結果タイプ
export interface DiagnosisResultType {
    diagnosisId?: string;
    typeId: string;
    name: string;
    description: string;
    icon: string;
}

// ==============================
// アンケート関連
// ==============================

// アンケート
export interface Survey {
    id: string;
    title: string;
    description: string;
    status: 'draft' | 'active' | 'closed';
    createdAt: string;
    updatedAt: string;
    questions?: SurveyQuestion[];
}

// アンケート質問
export interface SurveyQuestion {
    surveyId?: string;
    questionId: string;
    order: number;
    type: 'single' | 'multiple' | 'text_short' | 'text_long' | 'scale' | 'nps';
    text: string;
    options: SurveyOption[];
    required: boolean;
}

// アンケート選択肢
export interface SurveyOption {
    id: string;
    text: string;
    value?: number; // スケール用
}

// アンケート回答
export interface SurveyResponse {
    responseId: string;
    surveyId: string;
    userId: string;
    answers: Record<string, string | string[] | number>;
    submittedAt: string;
}

// アンケート集計結果
export interface SurveyStats {
    surveyId: string;
    totalResponses: number;
    questions: SurveyQuestionStats[];
}

// 質問ごとの集計
export interface SurveyQuestionStats {
    questionId: string;
    text: string;
    type: string;
    totalAnswers: number;
    breakdown: Record<string, number>;
}

// ==============================
// 友達追加フロー設定
// ==============================

// 旧フロー設定（後方互換）
export interface OnboardingFlowSettings {
    diagnosisEnabled: boolean;
    diagnosisTemplateId: string;
    profileFields: string[];
    applyRichMenu: boolean;
    completionMessage: string;
}

// プロフィールフィールド定義
export interface ProfileFieldDefinition {
    id: string;
    label: string;
    type: 'text' | 'select' | 'region' | 'prefecture';
    required: boolean;
    options?: string[];
}

// ==============================
// フロービルダー
// ==============================

// オンボーディングフロー
export interface OnboardingFlow {
    id: string;
    name: string;
    steps: FlowStep[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// フローステップ
export interface FlowStep {
    id: string;
    order: number;
    type: 'message' | 'question' | 'diagnosis' | 'profile_input' | 'branch';

    // message: 固定テキスト送信
    messageText?: string;

    // question/profile_input: プロフィール収集
    fieldId?: string;           // 'name', 'grade', 'region', etc.
    questionText?: string;      // カスタム質問文
    inputType?: 'text' | 'buttons' | 'quick_reply';
    options?: string[];         // 選択肢
    tagMapping?: Record<string, string>;  // 回答 → タグ

    // diagnosis: 診断実行
    diagnosisTemplateId?: string;

    // branch: 分岐
    branchQuestion?: string;
    branches?: FlowBranch[];
}

// 分岐オプション
export interface FlowBranch {
    id: string;
    label: string;
    action: 'proceed' | 'skip_to_step' | 'end';
    targetStepId?: string;
}

// ステップタイプ定義
export interface FlowStepTypeDefinition {
    type: FlowStep['type'];
    label: string;
    icon: string;
    description: string;
}

// ==============================
// ユーザー分析関連
// ==============================

// ユーザー能力値（レーダーチャート用）
export interface UserAbilityStats {
    engagement: number;      // 熱量 (0-100)
    learningDrive: number;   // 学習意欲 (0-100)
    responsiveness: number;  // 反応速度 (0-100)
    loyalty: number;         // 愛着度 (0-100)
    communication: number;   // 発信力 (0-100)
}

// 活動ログ（タイムライン用）
export interface UserActivity {
    id: string;
    type: 'login' | 'message_sent' | 'message_received' | 'diagnosis' | 'survey' | 'page_view' | 'rich_menu';
    description: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

// エンゲージメントスコア
export interface EngagementScore {
    score: number;           // 総合スコア (0-100)
    trend: 'up' | 'down' | 'stable';
    lastUpdated: string;
    breakdown?: {
        loginFrequency: number;
        messageRate: number;
        contentEngagement: number;
    };
}

// ネクストアクション
export interface NextAction {
    id: string;
    priority: 'high' | 'medium' | 'low';
    type: 'follow_up' | 'upsell' | 'reminder' | 'check_in';
    title: string;
    description: string;
    reason: string;
    dueDate?: string;
}

// 活動ヒートマップデータ
export interface ActivityHeatmapData {
    date: string;      // YYYY-MM-DD形式
    count: number;     // その日の活動数
    level: 0 | 1 | 2 | 3 | 4;  // 濃淡レベル
}

// 類似ユーザー
export interface SimilarUser {
    userId: string;
    name: string;
    matchScore: number;      // 類似度 (0-100)
    matchReasons: string[];  // マッチ理由
    diagnosisType?: string;
    successCase?: string;    // 成功事例（例：「プレミアムプラン契約」）
}

// ユーザー分析統合型
export interface UserAnalytics {
    userId: string;
    abilities: UserAbilityStats;
    activities: UserActivity[];
    engagement: EngagementScore;
    nextActions: NextAction[];
    heatmapData?: ActivityHeatmapData[];
    similarUsers?: SimilarUser[];
}
