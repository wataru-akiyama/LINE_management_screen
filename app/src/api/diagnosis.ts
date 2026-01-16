import type { DiagnosisHistory, DiagnosisQuestionTexts, ApiResponse } from '../types';
import { gasApiClient } from './client';

// 診断履歴を取得する
export async function getDiagnosisHistory(userId: string): Promise<DiagnosisHistory[]> {
    try {
        const response = await gasApiClient<ApiResponse<DiagnosisHistory[]>>(
            'getDiagnosisHistory',
            { userId }
        );

        if (response.success && response.data) {
            return response.data;
        }

        return [];
    } catch (error) {
        console.error('getDiagnosisHistory error:', error);
        return [];
    }
}

// 診断質問テキストを取得する
export async function getDiagnosisQuestionTexts(): Promise<DiagnosisQuestionTexts> {
    try {
        const response = await gasApiClient<ApiResponse<DiagnosisQuestionTexts>>(
            'getDiagnosisQuestionTexts'
        );

        if (response.success && response.data) {
            return response.data;
        }

        // デフォルト値
        return {
            q1: '将来、サッカーを仕事にしたい',
            q2: '強い相手と戦える環境に身を置きたい',
            q3: 'チームで成し遂げることの方が嬉しい',
            q4: 'サッカー以外の大学生活も充実させたい',
            q5: '運営を自分たちで考えるチームに興味がある',
            q6: '厳しい環境で自分を追い込みたい',
            q7: 'サッカーをしている時間そのものが好き',
            q8: '選手以外の形でもサッカーに関わりたい'
        };
    } catch (error) {
        console.error('getDiagnosisQuestionTexts error:', error);
        return {
            q1: '将来、サッカーを仕事にしたい',
            q2: '強い相手と戦える環境に身を置きたい',
            q3: 'チームで成し遂げることの方が嬉しい',
            q4: 'サッカー以外の大学生活も充実させたい',
            q5: '運営を自分たちで考えるチームに興味がある',
            q6: '厳しい環境で自分を追い込みたい',
            q7: 'サッカーをしている時間そのものが好き',
            q8: '選手以外の形でもサッカーに関わりたい'
        };
    }
}
