import type { DeliveryLog, StepDeliveryConfig, DeliveryFilter, ApiResponse, Statistics } from '../types';
import { gasApiClient } from './client';

// 統計情報取得
export async function getStatistics(): Promise<Statistics> {
    try {
        const response = await gasApiClient<ApiResponse<Statistics>>(
            'getStatistics'
        );

        if (response.success && response.data) {
            return response.data;
        }

        return {
            totalUsers: 0,
            basicUsers: 0,
            freeUsers: 0,
            grade3Users: 0,
            diagnosisCompleted: 0
        };
    } catch (error) {
        console.error('getStatistics error:', error);
        return {
            totalUsers: 0,
            basicUsers: 0,
            freeUsers: 0,
            grade3Users: 0,
            diagnosisCompleted: 0
        };
    }
}

// 配信履歴取得
export async function getDeliveryLogs(): Promise<DeliveryLog[]> {
    try {
        const response = await gasApiClient<ApiResponse<DeliveryLog[]>>(
            'getDeliveryLogs'
        );

        if (response.success && response.data) {
            return response.data;
        }

        return [];
    } catch (error) {
        console.error('getDeliveryLogs error:', error);
        return [];
    }
}

// 一斉配信
export async function broadcastMessage(
    content: string
): Promise<ApiResponse<{ deliveryId: string; targetCount: number }>> {
    try {
        const response = await gasApiClient<ApiResponse<{ success: boolean; targetCount: number }>>(
            'broadcast',
            {},
            { content, messageType: 'text' }
        );

        if (response.success && response.data) {
            return {
                success: true,
                data: {
                    deliveryId: `del_${Date.now()}`,
                    targetCount: response.data.targetCount || 0
                }
            };
        }

        return { success: false, error: { code: 'BROADCAST_FAILED', message: '配信に失敗しました' } };
    } catch (error) {
        console.error('broadcastMessage error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

// セグメント配信
export async function segmentDelivery(
    filter: DeliveryFilter,
    content: string
): Promise<ApiResponse<{ deliveryId: string; targetCount: number }>> {
    try {
        const response = await gasApiClient<ApiResponse<{ success: boolean; targetCount: number }>>(
            'segmentDelivery',
            { filter: JSON.stringify(filter) },
            { content, messageType: 'text' }
        );

        if (response.success && response.data) {
            return {
                success: true,
                data: {
                    deliveryId: `del_${Date.now()}`,
                    targetCount: response.data.targetCount || 0
                }
            };
        }

        return { success: false, error: { code: 'SEGMENT_FAILED', message: '配信に失敗しました' } };
    } catch (error) {
        console.error('segmentDelivery error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

// 予約配信
export async function scheduleDelivery(
    filter: DeliveryFilter | null,
    content: string,
    scheduledAt: string
): Promise<ApiResponse<{ deliveryId: string; targetCount: number }>> {
    try {
        const response = await gasApiClient<ApiResponse<{ success: boolean; deliveryId: string; targetCount: number }>>(
            'scheduleDelivery',
            {
                filter: filter ? JSON.stringify(filter) : '',
                content,
                scheduledAt
            }
        );

        if (response.success && response.data) {
            return {
                success: true,
                data: {
                    deliveryId: response.data.deliveryId || `del_${Date.now()}`,
                    targetCount: response.data.targetCount || 0
                }
            };
        }

        return { success: false, error: { code: 'SCHEDULE_FAILED', message: '予約に失敗しました' } };
    } catch (error) {
        console.error('scheduleDelivery error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

// ステップ配信設定一覧取得
export async function getStepDeliveryConfigs(): Promise<StepDeliveryConfig[]> {
    try {
        const response = await gasApiClient<ApiResponse<StepDeliveryConfig[]>>(
            'getStepDeliveryConfigs'
        );

        if (response.success && response.data) {
            return response.data;
        }

        return [];
    } catch (error) {
        console.error('getStepDeliveryConfigs error:', error);
        return [];
    }
}

// ステップ配信設定更新
export async function updateStepDeliveryConfig(
    stepId: string,
    data: Partial<StepDeliveryConfig>
): Promise<ApiResponse<StepDeliveryConfig>> {
    try {
        const response = await gasApiClient<ApiResponse<{ success: boolean }>>(
            'updateStepDeliveryConfig',
            { stepId },
            data
        );

        if (response.success) {
            return { success: true };
        }

        return { success: false, error: { code: 'UPDATE_FAILED', message: '更新に失敗しました' } };
    } catch (error) {
        console.error('updateStepDeliveryConfig error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}
