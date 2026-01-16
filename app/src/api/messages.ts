import type { Message, ApiResponse } from '../types';
import { gasApiClient } from './client';

// チャット履歴取得
export async function getMessages(
    userId: string,
    limit: number = 50
): Promise<{ messages: Message[]; hasMore: boolean }> {
    try {
        const response = await gasApiClient<ApiResponse<{ messages: Message[]; hasMore: boolean }>>(
            'getMessages',
            { userId, limit }
        );

        if (response.success && response.data) {
            return response.data;
        }

        return { messages: [], hasMore: false };
    } catch (error) {
        console.error('getMessages error:', error);
        return { messages: [], hasMore: false };
    }
}

// メッセージ送信
export async function sendMessage(
    userId: string,
    content: string,
    messageType: 'text' | 'image' = 'text'
): Promise<ApiResponse<Message>> {
    try {
        const response = await gasApiClient<ApiResponse<Message>>(
            'sendMessage',
            { userId },
            { content, messageType }
        );

        if (response.success && response.data) {
            return { success: true, data: response.data };
        }

        return { success: false, error: { code: 'SEND_FAILED', message: '送信に失敗しました' } };
    } catch (error) {
        console.error('sendMessage error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

// 未読カウントリセット
export async function resetUnreadCount(userId: string): Promise<boolean> {
    try {
        const response = await gasApiClient<ApiResponse<void>>(
            'resetUnreadCount',
            { userId }
        );
        return !!response.success;
    } catch (error) {
        console.error('resetUnreadCount error:', error);
        return false;
    }
}

// 未読総数取得
export async function getUnreadTotal(): Promise<number> {
    try {
        const response = await gasApiClient<ApiResponse<{ count: number }>>('getUnreadCount');
        if (response.success && response.data) {
            return response.data.count;
        }
        return 0;
    } catch (error) {
        console.error('getUnreadTotal error:', error);
        return 0;
    }
}
