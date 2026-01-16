import { gasApiClient } from './client';
import type { ApiResponse } from '../types';

export interface MessageQuota {
    quotaType: 'limited' | 'unlimited' | 'unknown';
    limit: number;
    used: number;
    remaining: number;
    percentage: number;
    error?: string;
}

export async function getMessageQuota(): Promise<MessageQuota> {
    try {
        const response = await gasApiClient<ApiResponse<MessageQuota>>(
            'getMessageQuota',
            {}
        );

        if (response.success && response.data) {
            return response.data;
        }

        return {
            quotaType: 'unknown',
            limit: 0,
            used: 0,
            remaining: 0,
            percentage: 0
        };
    } catch (error) {
        console.error('getMessageQuota error:', error);
        return {
            quotaType: 'unknown',
            limit: 0,
            used: 0,
            remaining: 0,
            percentage: 0,
            error: String(error)
        };
    }
}
