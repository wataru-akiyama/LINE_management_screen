import { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
    getOnboardingFlowSettings,
    updateOnboardingFlowSettings,
    getProfileFieldDefinitions,
    getAvailableDiagnosisTemplates,
} from '../api/onboardingFlow';
import type { OnboardingFlowSettings, ProfileFieldDefinition, DiagnosisTemplate } from '../types';

// アイコン
const SaveIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

export function OnboardingFlowSettingsPage() {
    const [settings, setSettings] = useState<OnboardingFlowSettings | null>(null);
    const [fieldDefs, setFieldDefs] = useState<ProfileFieldDefinition[]>([]);
    const [templates, setTemplates] = useState<DiagnosisTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // デフォルト値を先に設定（GASがなくても画面を表示）
        const defaultSettings: OnboardingFlowSettings = {
            diagnosisEnabled: true,
            diagnosisTemplateId: '',
            profileFields: ['name', 'grade', 'region', 'prefecture', 'teamName'],
            applyRichMenu: true,
            completionMessage: 'ありがとうございます！',
        };

        const defaultFields: ProfileFieldDefinition[] = [
            { id: 'name', label: 'お名前', type: 'text', required: true },
            { id: 'grade', label: '学年', type: 'select', required: true, options: ['高1', '高2', '高3', '保護者', '指導者'] },
            { id: 'region', label: '地域', type: 'region', required: true },
            { id: 'prefecture', label: '都道府県', type: 'prefecture', required: true },
            { id: 'teamName', label: 'チーム名', type: 'text', required: false }
        ];

        // まずデフォルト値で表示
        setSettings(defaultSettings);
        setFieldDefs(defaultFields);
        setTemplates([]);
        setLoading(false);

        // バックグラウンドでAPIからデータを取得（失敗しても無視）
        try {
            const [settingsData, fieldsData, templatesData] = await Promise.all([
                getOnboardingFlowSettings().catch(() => null),
                getProfileFieldDefinitions().catch(() => [] as ProfileFieldDefinition[]),
                getAvailableDiagnosisTemplates().catch(() => [] as DiagnosisTemplate[]),
            ]);

            if (settingsData) setSettings(settingsData);
            if (fieldsData && fieldsData.length > 0) setFieldDefs(fieldsData);
            if (templatesData && templatesData.length > 0) setTemplates(templatesData);
        } catch (err) {
            console.error('Load data error:', err);
            // エラーでも何もしない（既にデフォルト値がセットされている）
        }
    };

    const handleSave = async () => {
        if (!settings) return;

        setSaving(true);
        setSaved(false);
        try {
            const result = await updateOnboardingFlowSettings(settings);
            if (result.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } else {
                alert('保存に失敗しました');
            }
        } catch (err) {
            console.error(err);
            alert('保存に失敗しました');
        } finally {
            setSaving(false);
        }
    };

    const toggleProfileField = (fieldId: string) => {
        if (!settings) return;

        const currentFields = settings.profileFields || [];
        const newFields = currentFields.includes(fieldId)
            ? currentFields.filter(f => f !== fieldId)
            : [...currentFields, fieldId];

        setSettings({ ...settings, profileFields: newFields });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="p-6 text-center text-gray-500">
                設定を読み込めませんでした
            </div>
        );
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            {/* ヘッダー */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">友達追加フロー設定</h1>
                    <p className="text-gray-500 mt-1">友達追加時の診断・プロフィール収集フローを設定</p>
                </div>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2"
                >
                    {saving ? (
                        '保存中...'
                    ) : saved ? (
                        <>
                            <SaveIcon />
                            保存しました
                        </>
                    ) : (
                        '保存'
                    )}
                </Button>
            </div>

            {/* ステップ1: 志向性診断 */}
            <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">ステップ1: 志向性診断</h2>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={settings.diagnosisEnabled}
                            onChange={(e) => setSettings({ ...settings, diagnosisEnabled: e.target.checked })}
                            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">有効</span>
                    </label>
                </div>

                {settings.diagnosisEnabled && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">使用する診断テンプレート</label>
                            <select
                                value={settings.diagnosisTemplateId}
                                onChange={(e) => setSettings({ ...settings, diagnosisTemplateId: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">従来のハードコード診断を使用</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.name} ({t.questions?.length || 0}問)
                                    </option>
                                ))}
                            </select>
                            {templates.length === 0 && (
                                <p className="text-sm text-amber-600 mt-2">
                                    ※ 診断管理で「公開」状態のテンプレートを作成すると選択できます
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </Card>

            {/* ステップ2: プロフィール収集 */}
            <Card className="p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">ステップ2: プロフィール収集</h2>
                <p className="text-sm text-gray-500 mb-4">収集する情報を選択してください</p>

                <div className="space-y-3">
                    {fieldDefs.map(field => (
                        <label
                            key={field.id}
                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={(settings.profileFields || []).includes(field.id)}
                                onChange={() => toggleProfileField(field.id)}
                                disabled={field.required}
                                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                            />
                            <div className="flex-1">
                                <span className="text-gray-800">{field.label}</span>
                                {field.required && (
                                    <span className="text-xs text-red-500 ml-2">必須</span>
                                )}
                            </div>
                            <span className="text-xs text-gray-400">
                                {field.type === 'text' && 'テキスト入力'}
                                {field.type === 'select' && '選択式'}
                                {field.type === 'region' && '地域選択'}
                                {field.type === 'prefecture' && '都道府県選択'}
                            </span>
                        </label>
                    ))}
                </div>

                {fieldDefs.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                        フィールド定義を読み込めませんでした（デフォルト設定を使用）
                    </div>
                )}
            </Card>

            {/* 完了時アクション */}
            <Card className="p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">完了時アクション</h2>

                <div className="space-y-4">
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.applyRichMenu}
                            onChange={(e) => setSettings({ ...settings, applyRichMenu: e.target.checked })}
                            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-gray-800">リッチメニューを適用（プラン別）</span>
                    </label>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">完了メッセージ</label>
                        <textarea
                            value={settings.completionMessage}
                            onChange={(e) => setSettings({ ...settings, completionMessage: e.target.value })}
                            placeholder="登録完了時に送信するメッセージ"
                            rows={3}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        />
                    </div>
                </div>
            </Card>

            {/* プレビュー */}
            <Card className="p-6 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">フロープレビュー</h2>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs">1</span>
                        <span className={settings.diagnosisEnabled ? 'text-gray-800' : 'text-gray-400 line-through'}>
                            志向性診断
                            {settings.diagnosisEnabled && settings.diagnosisTemplateId && (
                                <span className="text-primary-600 ml-1">
                                    ({templates.find(t => t.id === settings.diagnosisTemplateId)?.name || 'カスタム'})
                                </span>
                            )}
                        </span>
                    </div>
                    {(settings.profileFields || []).map((fieldId, index) => {
                        const field = fieldDefs.find(f => f.id === fieldId);
                        return (
                            <div key={fieldId} className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs">
                                    {(settings.diagnosisEnabled ? 2 : 1) + index}
                                </span>
                                <span className="text-gray-800">{field?.label || fieldId}</span>
                            </div>
                        );
                    })}
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">✓</span>
                        <span className="text-gray-800">完了</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
