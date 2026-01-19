import type { DiagnosisTemplate, ApiResponse } from '../types';
import { gasApiClient, gasApiClientWithBody } from './client';

// 診断テンプレート一覧取得
export async function getDiagnosisTemplates(): Promise<{ templates: DiagnosisTemplate[] }> {
    try {
        const response = await gasApiClient<ApiResponse<{ templates: DiagnosisTemplate[] }>>(
            'getDiagnosisTemplates'
        );
        if (response.success && response.data) {
            return response.data;
        }
        return { templates: [] };
    } catch (error) {
        console.error('getDiagnosisTemplates error:', error);
        return { templates: [] };
    }
}

// 診断テンプレート詳細取得（質問・結果タイプ含む）
export async function getDiagnosisTemplate(id: string): Promise<DiagnosisTemplate | null> {
    try {
        const response = await gasApiClient<ApiResponse<DiagnosisTemplate>>(
            'getDiagnosisTemplate',
            { id }
        );
        if (response.success && response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('getDiagnosisTemplate error:', error);
        return null;
    }
}

// 診断テンプレート作成（POSTボディで送信）
export async function createDiagnosisTemplate(
    data: Partial<DiagnosisTemplate>
): Promise<ApiResponse<{ id: string }>> {
    try {
        const response = await gasApiClientWithBody<ApiResponse<{ id: string }>>(
            'createDiagnosisTemplate',
            {},
            data
        );
        return response;
    } catch (error) {
        console.error('createDiagnosisTemplate error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

// 診断テンプレート更新（POSTボディで送信）
export async function updateDiagnosisTemplate(
    id: string,
    data: Partial<DiagnosisTemplate>
): Promise<ApiResponse<{ id: string }>> {
    try {
        const response = await gasApiClientWithBody<ApiResponse<{ id: string }>>(
            'updateDiagnosisTemplate',
            { id },
            data
        );
        return response;
    } catch (error) {
        console.error('updateDiagnosisTemplate error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

// 診断テンプレート削除
export async function deleteDiagnosisTemplate(id: string): Promise<ApiResponse<void>> {
    try {
        const response = await gasApiClient<ApiResponse<void>>(
            'deleteDiagnosisTemplate',
            { id }
        );
        return response;
    } catch (error) {
        console.error('deleteDiagnosisTemplate error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

