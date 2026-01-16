import { gasApiClient } from './client';
import type { Template, ApiResponse } from '../types';

// テンプレート一覧取得
export async function getTemplates(category?: string): Promise<{ templates: Template[] }> {
    try {
        const params: Record<string, string> = {};
        if (category) {
            params.category = category;
        }

        const response = await gasApiClient<ApiResponse<{ templates: Template[] }>>(
            'getTemplates',
            params
        );

        if (response.success && response.data) {
            return response.data;
        }

        return { templates: [] };
    } catch (error) {
        console.error('getTemplates error:', error);
        return { templates: [] };
    }
}

// テンプレート作成
export async function createTemplate(data: {
    name: string;
    content: string;
    category?: string;
}): Promise<ApiResponse<Template>> {
    try {
        const response = await gasApiClient<ApiResponse<{ templateId: string; template: Template }>>(
            'createTemplate',
            {},
            data
        );

        if (response.success && response.data) {
            return { success: true, data: response.data.template };
        }

        return { success: false, error: { code: 'CREATE_FAILED', message: '作成に失敗しました' } };
    } catch (error) {
        console.error('createTemplate error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

// テンプレート更新
export async function updateTemplate(
    templateId: string,
    data: Partial<Template>
): Promise<ApiResponse<Template>> {
    try {
        const response = await gasApiClient<ApiResponse<{ success: boolean }>>(
            'updateTemplate',
            { templateId },
            data
        );

        if (response.success) {
            return { success: true };
        }

        return { success: false, error: { code: 'UPDATE_FAILED', message: '更新に失敗しました' } };
    } catch (error) {
        console.error('updateTemplate error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

// テンプレート削除
export async function deleteTemplate(templateId: string): Promise<ApiResponse<void>> {
    try {
        const response = await gasApiClient<ApiResponse<{ success: boolean }>>(
            'deleteTemplate',
            { templateId }
        );

        if (response.success) {
            return { success: true };
        }

        return { success: false, error: { code: 'DELETE_FAILED', message: '削除に失敗しました' } };
    } catch (error) {
        console.error('deleteTemplate error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

// カテゴリ一覧取得
export async function getTemplateCategories(): Promise<{ categories: string[] }> {
    try {
        const response = await gasApiClient<ApiResponse<{ categories: string[] }>>(
            'getTemplateCategories',
            {}
        );

        if (response.success && response.data) {
            return response.data;
        }

        return { categories: [] };
    } catch (error) {
        console.error('getTemplateCategories error:', error);
        return { categories: [] };
    }
}
