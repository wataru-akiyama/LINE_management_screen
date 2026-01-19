import type { OnboardingFlowSettings, ProfileFieldDefinition, DiagnosisTemplate, ApiResponse } from '../types';
import { gasApiClient, gasApiClientWithBody } from './client';

// フロー設定を取得
export async function getOnboardingFlowSettings(): Promise<OnboardingFlowSettings | null> {
    try {
        const response = await gasApiClient<ApiResponse<OnboardingFlowSettings>>(
            'getOnboardingFlowSettings'
        );
        if (response.success && response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('getOnboardingFlowSettings error:', error);
        return null;
    }
}

// フロー設定を更新
export async function updateOnboardingFlowSettings(
    settings: Partial<OnboardingFlowSettings>
): Promise<ApiResponse<{ success: boolean }>> {
    try {
        const response = await gasApiClientWithBody<ApiResponse<{ success: boolean }>>(
            'updateOnboardingFlowSettings',
            {},
            settings
        );
        return response;
    } catch (error) {
        console.error('updateOnboardingFlowSettings error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

// プロフィールフィールド定義を取得
export async function getProfileFieldDefinitions(): Promise<ProfileFieldDefinition[]> {
    try {
        const response = await gasApiClient<ApiResponse<{ fields: ProfileFieldDefinition[] }>>(
            'getProfileFieldDefinitions'
        );
        if (response.success && response.data?.fields) {
            return response.data.fields;
        }
        return [];
    } catch (error) {
        console.error('getProfileFieldDefinitions error:', error);
        return [];
    }
}

// 利用可能な診断テンプレート一覧を取得
export async function getAvailableDiagnosisTemplates(): Promise<DiagnosisTemplate[]> {
    try {
        const response = await gasApiClient<ApiResponse<{ templates: DiagnosisTemplate[] }>>(
            'getAvailableDiagnosisTemplates'
        );
        if (response.success && response.data?.templates) {
            return response.data.templates;
        }
        return [];
    } catch (error) {
        console.error('getAvailableDiagnosisTemplates error:', error);
        return [];
    }
}
