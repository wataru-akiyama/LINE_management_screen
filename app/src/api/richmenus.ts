import type { RichMenu, RichMenuPlanMapping, ApiResponse } from '../types';
import { gasApiClient, gasApiClientWithBody } from './client';

// リッチメニュー一覧取得
export async function getRichMenus(): Promise<{ menus: RichMenu[] }> {
    try {
        const response = await gasApiClient<ApiResponse<{ menus: RichMenu[] }>>('getRichMenus');
        if (response.success && response.data) {
            return response.data;
        }
        return { menus: [] };
    } catch (error) {
        console.error('getRichMenus error:', error);
        return { menus: [] };
    }
}

// リッチメニュー詳細取得
export async function getRichMenu(id: string): Promise<RichMenu | null> {
    try {
        const response = await gasApiClient<ApiResponse<RichMenu>>('getRichMenu', { id });
        if (response.success && response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('getRichMenu error:', error);
        return null;
    }
}

// リッチメニュー作成
export async function createRichMenu(data: Partial<RichMenu>): Promise<ApiResponse<{ id: string }>> {
    try {
        const response = await gasApiClient<ApiResponse<{ id: string }>>(
            'createRichMenu',
            {},
            data
        );
        return response;
    } catch (error) {
        console.error('createRichMenu error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

// リッチメニュー更新
export async function updateRichMenu(id: string, data: Partial<RichMenu>): Promise<ApiResponse<{ id: string }>> {
    try {
        const response = await gasApiClient<ApiResponse<{ id: string }>>(
            'updateRichMenu',
            { id },
            data
        );
        return response;
    } catch (error) {
        console.error('updateRichMenu error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

// リッチメニュー削除
export async function deleteRichMenu(id: string): Promise<ApiResponse<void>> {
    try {
        const response = await gasApiClient<ApiResponse<void>>('deleteRichMenu', { id });
        return response;
    } catch (error) {
        console.error('deleteRichMenu error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

// リッチメニュー公開（LINE APIに作成）
export async function publishRichMenu(id: string): Promise<ApiResponse<{ lineRichMenuId: string }>> {
    try {
        const response = await gasApiClient<ApiResponse<{ lineRichMenuId: string }>>(
            'publishRichMenu',
            { id }
        );
        return response;
    } catch (error) {
        console.error('publishRichMenu error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

// リッチメニュー非公開（下書きに戻す）
export async function unpublishRichMenu(id: string): Promise<ApiResponse<void>> {
    try {
        const response = await gasApiClient<ApiResponse<void>>(
            'unpublishRichMenu',
            { id }
        );
        return response;
    } catch (error) {
        console.error('unpublishRichMenu error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

// プラン別メニュー設定取得
export async function getRichMenuPlanMappings(): Promise<{ mappings: RichMenuPlanMapping[] }> {
    try {
        const response = await gasApiClient<ApiResponse<{ mappings: RichMenuPlanMapping[] }>>(
            'getRichMenuPlanMappings'
        );
        if (response.success && response.data) {
            return response.data;
        }
        return { mappings: [] };
    } catch (error) {
        console.error('getRichMenuPlanMappings error:', error);
        return { mappings: [] };
    }
}

// プラン別メニュー設定更新
export async function updateRichMenuPlanMapping(
    plan: string,
    richMenuId: string
): Promise<ApiResponse<void>> {
    try {
        const response = await gasApiClient<ApiResponse<void>>(
            'updateRichMenuPlanMapping',
            { plan, richMenuId }
        );
        return response;
    } catch (error) {
        console.error('updateRichMenuPlanMapping error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}


// 全ユーザーにプランごとのメニュー設定を反映
export async function applyRichMenusToAllUsers(): Promise<ApiResponse<void>> {
    try {
        const response = await gasApiClient<ApiResponse<void>>('applyRichMenusToAllUsers');
        return response;
    } catch (error) {
        console.error('applyRichMenusToAllUsers error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

// ユーザーにリッチメニュー適用
export async function linkRichMenuToUser(
    userId: string,
    richMenuId: string
): Promise<ApiResponse<void>> {
    try {
        const response = await gasApiClient<ApiResponse<void>>(
            'linkRichMenuToUser',
            { userId, richMenuId }
        );
        return response;
    } catch (error) {
        console.error('linkRichMenuToUser error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

// リッチメニュー画像を取得
export async function getRichMenuImage(imageId: string): Promise<{ imageId: string; url: string } | null> {
    try {
        const response = await gasApiClient<ApiResponse<{ imageId: string; url: string }>>(
            'getRichMenuImage',
            { imageId }
        );
        if (response.success && response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('getRichMenuImage error:', error);
        return null;
    }
}

// リッチメニュー画像をアップロード
export async function uploadRichMenuImage(
    menuId: string | null,
    file: File
): Promise<ApiResponse<{ fileId: string; url: string }>> {
    try {
        // ファイルをBase64に変換
        const base64 = await fileToBase64(file);

        const response = await gasApiClientWithBody<ApiResponse<{ fileId: string; url: string }>>(
            'uploadRichMenuImage',
            { menuId: menuId || '' },
            {
                imageBase64: base64,
                mimeType: file.type,
                fileName: file.name
            }
        );
        console.log('uploadRichMenuImage response:', response);
        if (!response.success && response.error) {
            console.error('Upload failed:', response.error.code, response.error.message);
        }
        return response;
    } catch (error) {
        console.error('uploadRichMenuImage error:', error);
        return { success: false, error: { code: 'ERROR', message: String(error) } };
    }
}

// ファイルをBase64に変換するユーティリティ
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // "data:image/png;base64,..." の形式から base64部分だけ抽出
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
