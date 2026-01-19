import type { Survey, SurveyResponse, SurveyStats, ApiResponse } from '../types';
import { gasApiClient, gasApiClientWithBody } from './client';

// アンケート一覧取得
export async function getSurveys(): Promise<{ surveys: Survey[] }> {
    try {
        const response = await gasApiClient<ApiResponse<{ surveys: Survey[] }>>(
            'getSurveys'
        );
        if (response.success && response.data) {
            return response.data;
        }
        return { surveys: [] };
    } catch (error) {
        console.error('getSurveys error:', error);
        return { surveys: [] };
    }
}

// アンケート詳細取得（質問含む）
export async function getSurvey(id: string): Promise<Survey | null> {
    try {
        const response = await gasApiClient<ApiResponse<Survey>>(
            'getSurvey',
            { id }
        );
        if (response.success && response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('getSurvey error:', error);
        return null;
    }
}

// アンケート作成（POSTボディで送信）
export async function createSurvey(
    data: Partial<Survey>
): Promise<ApiResponse<{ id: string }>> {
    try {
        const response = await gasApiClientWithBody<ApiResponse<{ id: string }>>(
            'createSurvey',
            {},
            data
        );
        return response;
    } catch (error) {
        console.error('createSurvey error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

// アンケート更新（POSTボディで送信）
export async function updateSurvey(
    id: string,
    data: Partial<Survey>
): Promise<ApiResponse<{ id: string }>> {
    try {
        const response = await gasApiClientWithBody<ApiResponse<{ id: string }>>(
            'updateSurvey',
            { id },
            data
        );
        return response;
    } catch (error) {
        console.error('updateSurvey error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

// アンケート削除
export async function deleteSurvey(id: string): Promise<ApiResponse<void>> {
    try {
        const response = await gasApiClient<ApiResponse<void>>(
            'deleteSurvey',
            { id }
        );
        return response;
    } catch (error) {
        console.error('deleteSurvey error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

// アンケート回答一覧取得
export async function getSurveyResponses(surveyId: string): Promise<{ responses: SurveyResponse[] }> {
    try {
        const response = await gasApiClient<ApiResponse<{ responses: SurveyResponse[] }>>(
            'getSurveyResponses',
            { surveyId }
        );
        if (response.success && response.data) {
            return response.data;
        }
        return { responses: [] };
    } catch (error) {
        console.error('getSurveyResponses error:', error);
        return { responses: [] };
    }
}

// アンケート集計結果取得
export async function getSurveyStats(surveyId: string): Promise<SurveyStats | null> {
    try {
        const response = await gasApiClient<ApiResponse<SurveyStats>>(
            'getSurveyStats',
            { surveyId }
        );
        if (response.success && response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('getSurveyStats error:', error);
        return null;
    }
}
