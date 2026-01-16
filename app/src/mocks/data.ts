import type { User, Message, Statistics, DeliveryLog, StepDeliveryConfig, Survey } from '../types';
import { format, subDays, addDays } from 'date-fns';

// 現在日時を基準にした日付を生成
const now = new Date();

// モックユーザーデータ
export const mockUsers: User[] = [
    {
        userId: 'U7d782f128a899caa001',
        name: '秋山 航',
        grade: '高3',
        region: '関東',
        prefecture: '東京都',
        teamName: 'FC東京U-18',
        plan: 'BASIC',
        lineId: 'line:U7d782f128a899caa001',
        registeredAt: format(subDays(now, 30), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        updatedAt: format(subDays(now, 2), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        universities: ['筑波大学', '早稲田大学', '順天堂大学'],
        diagnosis: {
            type: 'リーダータイプ',
            completedAt: format(subDays(now, 25), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        },
        customTags: ['要フォロー', '体験参加済'],
        hasUnreadMessages: true,
    },
    {
        userId: 'U7d782f128a899caa002',
        name: '田中 優斗',
        grade: '高2',
        region: '関東',
        prefecture: '神奈川県',
        teamName: '横浜FC ユース',
        plan: 'FREE',
        lineId: 'line:U7d782f128a899caa002',
        registeredAt: format(subDays(now, 45), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        updatedAt: format(subDays(now, 10), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        universities: ['慶應義塾大学'],
        diagnosis: {
            type: 'サポータータイプ',
            completedAt: format(subDays(now, 40), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        },
        customTags: [],
        hasUnreadMessages: false,
    },
    {
        userId: 'U7d782f128a899caa003',
        name: '佐藤 翔太',
        grade: '高3',
        region: '関西',
        prefecture: '大阪府',
        teamName: 'ガンバ大阪ユース',
        plan: 'BASIC',
        lineId: 'line:U7d782f128a899caa003',
        registeredAt: format(subDays(now, 60), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        updatedAt: format(subDays(now, 1), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        universities: ['関西大学', '同志社大学', '立命館大学'],
        diagnosis: {
            type: 'クリエイタータイプ',
            completedAt: format(subDays(now, 55), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        },
        customTags: ['優先対応'],
        hasUnreadMessages: true,
    },
    {
        userId: 'U7d782f128a899caa004',
        name: '山田 健太',
        grade: '高1',
        region: '東北',
        prefecture: '宮城県',
        teamName: 'ベガルタ仙台ユース',
        plan: 'FREE',
        lineId: 'line:U7d782f128a899caa004',
        registeredAt: format(subDays(now, 14), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        updatedAt: format(subDays(now, 14), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        universities: [],
        customTags: [],
        hasUnreadMessages: false,
    },
    {
        userId: 'U7d782f128a899caa005',
        name: '鈴木 大地',
        grade: '高3',
        region: '関東',
        prefecture: '埼玉県',
        teamName: '浦和レッズユース',
        plan: 'BASIC',
        lineId: 'line:U7d782f128a899caa005',
        registeredAt: format(subDays(now, 90), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        updatedAt: format(subDays(now, 5), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        universities: ['中央大学', '法政大学'],
        diagnosis: {
            type: 'アナリストタイプ',
            completedAt: format(subDays(now, 85), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        },
        customTags: ['体験参加済'],
        hasUnreadMessages: false,
    },
    {
        userId: 'U7d782f128a899caa006',
        name: '高橋 陸',
        grade: '高2',
        region: '九州',
        prefecture: '福岡県',
        teamName: 'アビスパ福岡U-18',
        plan: 'FREE',
        lineId: 'line:U7d782f128a899caa006',
        registeredAt: format(subDays(now, 20), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        updatedAt: format(subDays(now, 15), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        universities: ['福岡大学', '九州大学'],
        customTags: [],
        hasUnreadMessages: true,
    },
    {
        userId: 'U7d782f128a899caa007',
        name: '伊藤 蓮',
        grade: '高3',
        region: '中部',
        prefecture: '愛知県',
        teamName: '名古屋グランパスU-18',
        plan: 'BASIC',
        lineId: 'line:U7d782f128a899caa007',
        registeredAt: format(subDays(now, 120), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        updatedAt: format(subDays(now, 3), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        universities: ['中京大学', '名古屋大学', '静岡大学'],
        diagnosis: {
            type: 'リーダータイプ',
            completedAt: format(subDays(now, 100), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        },
        customTags: ['要フォロー', '優先対応'],
        hasUnreadMessages: false,
    },
    {
        userId: 'U7d782f128a899caa008',
        name: '渡辺 海斗',
        grade: '高1',
        region: '北海道',
        prefecture: '北海道',
        teamName: 'コンサドーレ札幌U-18',
        plan: 'FREE',
        lineId: 'line:U7d782f128a899caa008',
        registeredAt: format(subDays(now, 7), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        updatedAt: format(subDays(now, 7), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        universities: [],
        customTags: [],
        hasUnreadMessages: false,
    },
];

// モックメッセージデータ
export const mockMessages: Record<string, Message[]> = {
    'U7d782f128a899caa001': [
        {
            messageId: 'msg_001',
            userId: 'U7d782f128a899caa001',
            direction: 'incoming',
            messageType: 'text',
            content: 'こんにちは！進路について相談したいです。',
            sentAt: format(subDays(now, 3), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        },
        {
            messageId: 'msg_002',
            userId: 'U7d782f128a899caa001',
            direction: 'outgoing',
            messageType: 'text',
            content: 'こんにちは！もちろんです。どのような進路をお考えですか？',
            sentAt: format(subDays(now, 3), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
            sentBy: 'admin@moish.jp',
        },
        {
            messageId: 'msg_003',
            userId: 'U7d782f128a899caa001',
            direction: 'incoming',
            messageType: 'text',
            content: '筑波大学に興味があるのですが、どんな選手が多いですか？',
            sentAt: format(subDays(now, 2), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        },
        {
            messageId: 'msg_004',
            userId: 'U7d782f128a899caa001',
            direction: 'outgoing',
            messageType: 'text',
            content: '筑波大学はサッカー部が強豪で、多くのプロ選手を輩出しています。練習環境も素晴らしいですよ！',
            sentAt: format(subDays(now, 2), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
            sentBy: 'admin@moish.jp',
        },
        {
            messageId: 'msg_005',
            userId: 'U7d782f128a899caa001',
            direction: 'incoming',
            messageType: 'text',
            content: 'ありがとうございます！推薦の方法についても教えていただけますか？',
            sentAt: format(subDays(now, 1), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        },
    ],
    'U7d782f128a899caa003': [
        {
            messageId: 'msg_101',
            userId: 'U7d782f128a899caa003',
            direction: 'incoming',
            messageType: 'text',
            content: '関西の大学で良いところはどこですか？',
            sentAt: format(subDays(now, 5), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        },
        {
            messageId: 'msg_102',
            userId: 'U7d782f128a899caa003',
            direction: 'outgoing',
            messageType: 'text',
            content: '関西大学、同志社大学、立命館大学がサッカー部として有名です。それぞれ特徴がありますので、詳しくご説明しますね。',
            sentAt: format(subDays(now, 5), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
            sentBy: 'admin@moish.jp',
        },
        {
            messageId: 'msg_103',
            userId: 'U7d782f128a899caa003',
            direction: 'incoming',
            messageType: 'text',
            content: '同志社大学について詳しく教えてください！',
            sentAt: format(subDays(now, 1), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        },
    ],
    'U7d782f128a899caa006': [
        {
            messageId: 'msg_201',
            userId: 'U7d782f128a899caa006',
            direction: 'incoming',
            messageType: 'text',
            content: 'BASICプランに興味があります！',
            sentAt: format(subDays(now, 1), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        },
    ],
};

// モック統計データ
export const mockStatistics: Statistics = {
    totalUsers: mockUsers.length,
    basicUsers: mockUsers.filter(u => u.plan === 'BASIC').length,
    freeUsers: mockUsers.filter(u => u.plan === 'FREE').length,
    grade3Users: mockUsers.filter(u => u.grade === '高3').length,
    diagnosisCompleted: mockUsers.filter(u => u.diagnosis).length,
};

// モック配信ログ
export const mockDeliveryLogs: DeliveryLog[] = [
    {
        deliveryId: 'del_001',
        deliveryType: 'broadcast',
        targetCount: 150,
        messageContent: { type: 'text', text: '新年のご挨拶メッセージ' },
        status: 'sent',
        sentAt: format(subDays(now, 7), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        createdBy: 'admin@moish.jp',
        createdAt: format(subDays(now, 7), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    },
    {
        deliveryId: 'del_002',
        deliveryType: 'segment',
        targetFilter: { grade: '高3', plan: 'BASIC' },
        targetCount: 45,
        messageContent: { type: 'text', text: '高3 BASICプランの皆さんへ特別なお知らせ' },
        status: 'sent',
        sentAt: format(subDays(now, 3), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        createdBy: 'admin@moish.jp',
        createdAt: format(subDays(now, 3), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    },
    {
        deliveryId: 'del_003',
        deliveryType: 'segment',
        targetFilter: { grade: '高3' },
        targetCount: 80,
        messageContent: { type: 'text', text: '進路相談会のお知らせ' },
        status: 'pending',
        scheduledAt: format(addDays(now, 2), "yyyy-MM-dd'T'10:00:00'Z'"),
        createdBy: 'admin@moish.jp',
        createdAt: format(now, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    },
];

// モックステップ配信設定
export const mockStepDeliveryConfigs: StepDeliveryConfig[] = [
    {
        stepId: 'step_001',
        stepName: 'ウェルカムメッセージ',
        daysAfterRegistration: 0,
        targetFilter: {},
        messageContent: { type: 'text', text: '友だち追加ありがとうございます！MOISHはあなたの進路をサポートします。' },
        isActive: true,
        createdAt: format(subDays(now, 90), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    },
    {
        stepId: 'step_002',
        stepName: '使い方ガイド',
        daysAfterRegistration: 1,
        targetFilter: {},
        messageContent: { type: 'text', text: 'MOISHの使い方をご紹介します！まずは性格診断を受けてみましょう。' },
        isActive: true,
        createdAt: format(subDays(now, 90), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    },
    {
        stepId: 'step_003',
        stepName: '診断促進メッセージ',
        daysAfterRegistration: 3,
        targetFilter: { diagnosisCompleted: 'false' },
        messageContent: { type: 'text', text: '性格診断はお済みですか？あなたに合った進路が見つかるかもしれません！' },
        isActive: true,
        createdAt: format(subDays(now, 90), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    },
    {
        stepId: 'step_004',
        stepName: 'BASICプラン案内',
        daysAfterRegistration: 7,
        targetFilter: { plan: 'FREE' },
        messageContent: { type: 'text', text: 'BASICプランでは、より詳しい進路相談が可能です！詳細はこちら→' },
        isActive: true,
        createdAt: format(subDays(now, 90), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    },
];

// モックアンケートデータ
export const mockSurveys: Survey[] = [
    {
        surveyId: 'survey_001',
        userId: 'U7d782f128a899caa001',
        surveyType: '進路希望調査',
        answers: {
            q1: '大学',
            q2: '体育系',
            q3: '関東',
        },
        submittedAt: format(subDays(now, 20), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    },
    {
        surveyId: 'survey_002',
        userId: 'U7d782f128a899caa003',
        surveyType: '満足度調査',
        answers: {
            q1: '5',
            q2: 'とても役に立っている',
        },
        submittedAt: format(subDays(now, 10), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    },
];

// 地域リスト
export const regions = [
    '北海道',
    '東北',
    '関東',
    '中部',
    '関西',
    '中国',
    '四国',
    '九州',
];

// 都道府県リスト
export const prefectures: Record<string, string[]> = {
    '北海道': ['北海道'],
    '東北': ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
    '関東': ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
    '中部': ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'],
    '関西': ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
    '中国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
    '四国': ['徳島県', '香川県', '愛媛県', '高知県'],
    '九州': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'],
};

// 学年リスト
export const grades = ['高1', '高2', '高3'];

// プランリスト
export const plans = ['FREE', 'BASIC'];

// 診断タイプリスト
export const diagnosisTypes = [
    'リーダータイプ',
    'サポータータイプ',
    'クリエイタータイプ',
    'アナリストタイプ',
];
