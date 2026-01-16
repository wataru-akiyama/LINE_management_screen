import type { User, ApiResponse, Pagination, UserFilters } from '../types';
import { gasApiClient } from './client';

// ユーザー一覧取得
export async function getUsers(
    filters: UserFilters = {}
): Promise<{ users: User[]; pagination: Pagination }> {
    try {
        const response = await gasApiClient<ApiResponse<{ users: User[]; pagination: Pagination }>>(
            'getUsers',
            {
                search: filters.search,
                grade: filters.grade,
                region: filters.region,
                plan: filters.plan,
                page: filters.page,
                limit: filters.limit,
            }
        );

        if (response.success && response.data) {
            return response.data;
        }

        // エラー時は空のリストを返す
        return {
            users: [],
            pagination: { total: 0, page: 1, limit: 50, totalPages: 0 }
        };
    } catch (error) {
        console.error('getUsers error:', error);
        return {
            users: [],
            pagination: { total: 0, page: 1, limit: 50, totalPages: 0 }
        };
    }
}

// ユーザー詳細取得
export async function getUser(userId: string): Promise<User | null> {
    try {
        const response = await gasApiClient<ApiResponse<User>>(
            'getUser',
            { userId }
        );

        if (response.success && response.data) {
            return response.data;
        }

        return null;
    } catch (error) {
        console.error('getUser error:', error);
        return null;
    }
}
// ユーザー情報更新
export async function updateUser(
    userId: string,
    data: Partial<User>
): Promise<ApiResponse<User>> {
    try {
        const response = await gasApiClient<ApiResponse<{ success: boolean }>>(
            'updateUser',
            { userId },
            data
        );

        if (response.success) {
            return { success: true };
        }

        return { success: false, error: { code: 'UPDATE_FAILED', message: '更新に失敗しました' } };
    } catch (error) {
        console.error('updateUser error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

// ユーザーステータス更新
export async function updateUserStatus(
    userId: string,
    status: 'unread' | 'in_progress' | 'done'
): Promise<ApiResponse<User>> {
    try {
        const response = await gasApiClient<ApiResponse<{ success: boolean }>>(
            'updateUserStatus',
            { userId, status }
        );

        if (response.success) {
            return { success: true };
        }

        return { success: false, error: { code: 'UPDATE_FAILED', message: '更新に失敗しました' } };
    } catch (error) {
        console.error('updateUserStatus error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}
