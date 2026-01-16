import { Header } from '../components/layout/Header';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

const KeyIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
);

const LinkIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
);

const InfoIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export function Settings() {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '未設定';
    const apiKey = import.meta.env.VITE_API_KEY ? '••••••••' + import.meta.env.VITE_API_KEY.slice(-4) : '未設定';

    return (
        <div className="min-h-screen">
            <Header title="設定" subtitle="システム設定" />

            <div className="p-6 max-w-3xl mx-auto">
                {/* API設定 */}
                <Card className="mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                            <KeyIcon />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">API設定</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                API エンドポイント
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={apiBaseUrl}
                                    readOnly
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-600"
                                />
                                <Button variant="secondary" size="sm">
                                    コピー
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                環境変数 VITE_API_BASE_URL で設定
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                API キー
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={apiKey}
                                    readOnly
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-600"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                環境変数 VITE_API_KEY で設定
                            </p>
                        </div>
                    </div>
                </Card>

                {/* LINE連携情報 */}
                <Card className="mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                            <LinkIcon />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">LINE連携</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">LINE Messaging API</p>
                                <p className="text-sm text-gray-500">GASで設定</p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                                接続済み
                            </span>
                        </div>

                        <div className="text-sm text-gray-600">
                            <p>LINE Messaging APIの設定は、Google Apps Script側で行います。</p>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-500">
                                <li>LINE_CHANNEL_ACCESS_TOKEN</li>
                                <li>LINE_CHANNEL_SECRET</li>
                                <li>Webhook URL</li>
                            </ul>
                        </div>
                    </div>
                </Card>

                {/* システム情報 */}
                <Card>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                            <InfoIcon />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">システム情報</h2>
                    </div>

                    <dl className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <dt className="text-gray-500">アプリケーション</dt>
                            <dd className="font-medium">MOISH LINE管理画面</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <dt className="text-gray-500">バージョン</dt>
                            <dd className="font-medium">1.0.0</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <dt className="text-gray-500">フロントエンド</dt>
                            <dd className="font-medium">React 18 + TypeScript + Vite</dd>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <dt className="text-gray-500">バックエンド</dt>
                            <dd className="font-medium">Google Apps Script</dd>
                        </div>
                        <div className="flex justify-between py-2">
                            <dt className="text-gray-500">データストア</dt>
                            <dd className="font-medium">Google スプレッドシート</dd>
                        </div>
                    </dl>
                </Card>

                {/* 開発モード表示 */}
                {!import.meta.env.VITE_API_BASE_URL && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <p className="font-medium text-yellow-800">開発モード</p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    API URLが設定されていないため、モックデータを使用しています。
                                    本番環境では <code className="px-1 py-0.5 bg-yellow-100 rounded">.env</code> ファイルで
                                    VITE_API_BASE_URL と VITE_API_KEY を設定してください。
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
