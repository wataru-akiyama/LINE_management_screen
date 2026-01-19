import { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import type { OnboardingFlow, FlowStep, FlowBranch, DiagnosisTemplate } from '../types';
import { getAvailableDiagnosisTemplates } from '../api/onboardingFlow';
import { LinePreview } from '../components/onboarding/LinePreview';

// ==============================
// アイコンコンポーネント
// ==============================

const PlusIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const ChevronUpIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

const SaveIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const PreviewIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

// ステップタイプアイコン
const StepTypeIcon = ({ type }: { type: FlowStep['type'] }) => {
    const icons: Record<FlowStep['type'], string> = {
        message: '📝',
        question: '❓',
        diagnosis: '🎯',
        profile_input: '👤',
        branch: '🔀',
    };
    return <span className="text-lg">{icons[type]}</span>;
};

// ==============================
// ステップタイプ定義
// ==============================

const STEP_TYPES = [
    { type: 'message' as const, label: 'メッセージ', icon: '📝', description: '固定テキストを送信' },
    { type: 'profile_input' as const, label: 'プロフィール入力', icon: '👤', description: 'ユーザー情報を収集' },
    { type: 'branch' as const, label: '分岐質問', icon: '🔀', description: '回答で次のステップを変更' },
    { type: 'diagnosis' as const, label: '診断', icon: '🎯', description: '志向性診断を実行' },
];

const PROFILE_FIELDS = [
    { id: 'name', label: 'お名前', inputType: 'text' },
    { id: 'grade', label: '学年', inputType: 'buttons', options: ['高1', '高2', '高3', '保護者', '指導者'] },
    { id: 'region', label: '地域', inputType: 'buttons' },
    { id: 'prefecture', label: '都道府県', inputType: 'buttons' },
    { id: 'teamName', label: 'チーム名', inputType: 'text' },
];

// ==============================
// ステップエディターコンポーネント
// ==============================

interface StepEditorProps {
    step: FlowStep;
    index: number;
    totalSteps: number;
    allSteps: FlowStep[];
    templates: DiagnosisTemplate[];
    onUpdate: (step: FlowStep) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}

const StepEditor = ({
    step,
    index,
    totalSteps,
    allSteps,
    templates,
    onUpdate,
    onDelete,
    onMoveUp,
    onMoveDown,
}: StepEditorProps) => {
    const [expanded, setExpanded] = useState(true);

    const handleAddBranch = () => {
        const newBranch: FlowBranch = {
            id: `branch_${Date.now()}`,
            label: '',
            action: 'proceed',
        };
        onUpdate({
            ...step,
            branches: [...(step.branches || []), newBranch],
        });
    };

    const handleUpdateBranch = (branchIndex: number, updates: Partial<FlowBranch>) => {
        const newBranches = [...(step.branches || [])];
        newBranches[branchIndex] = { ...newBranches[branchIndex], ...updates };
        onUpdate({ ...step, branches: newBranches });
    };

    const handleDeleteBranch = (branchIndex: number) => {
        const newBranches = (step.branches || []).filter((_, i) => i !== branchIndex);
        onUpdate({ ...step, branches: newBranches });
    };

    return (
        <Card className="mb-3 border-l-4 border-l-primary-500">
            {/* ヘッダー */}
            <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">
                        {index + 1}
                    </span>
                    <StepTypeIcon type={step.type} />
                    <span className="font-medium text-gray-800">
                        {step.type === 'message' && (step.messageText?.slice(0, 20) || 'メッセージ')}
                        {step.type === 'profile_input' && (PROFILE_FIELDS.find(f => f.id === step.fieldId)?.label || 'プロフィール入力')}
                        {step.type === 'branch' && (step.branchQuestion?.slice(0, 20) || '分岐質問')}
                        {step.type === 'diagnosis' && '志向性診断'}
                        {step.type === 'question' && (step.questionText?.slice(0, 20) || '質問')}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                        <ChevronUpIcon />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                        disabled={index === totalSteps - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                        <ChevronDownIcon />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-1 text-gray-400 hover:text-red-500"
                    >
                        <TrashIcon />
                    </button>
                </div>
            </div>

            {/* 編集フォーム */}
            {expanded && (
                <div className="p-4 pt-0 border-t border-gray-100">
                    {/* メッセージ */}
                    {step.type === 'message' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">メッセージ内容</label>
                            <textarea
                                value={step.messageText || ''}
                                onChange={(e) => onUpdate({ ...step, messageText: e.target.value })}
                                placeholder="送信するメッセージを入力..."
                                rows={3}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                            />
                        </div>
                    )}

                    {/* プロフィール入力 */}
                    {step.type === 'profile_input' && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">収集する情報</label>
                                <select
                                    value={step.fieldId || ''}
                                    onChange={(e) => {
                                        const field = PROFILE_FIELDS.find(f => f.id === e.target.value);
                                        onUpdate({
                                            ...step,
                                            fieldId: e.target.value,
                                            inputType: (field?.inputType as FlowStep['inputType']) || 'text',
                                            options: field?.options,
                                        });
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">選択してください</option>
                                    {PROFILE_FIELDS.map(f => (
                                        <option key={f.id} value={f.id}>{f.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">質問文（カスタム）</label>
                                <input
                                    type="text"
                                    value={step.questionText || ''}
                                    onChange={(e) => onUpdate({ ...step, questionText: e.target.value })}
                                    placeholder="例: お名前を教えてください"
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                    )}

                    {/* 分岐質問 */}
                    {step.type === 'branch' && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">質問文</label>
                                <input
                                    type="text"
                                    value={step.branchQuestion || ''}
                                    onChange={(e) => onUpdate({ ...step, branchQuestion: e.target.value })}
                                    placeholder="例: 診断を始めますか？"
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">選択肢と分岐先</label>
                                {(step.branches || []).map((branch, bi) => (
                                    <div key={branch.id} className="flex gap-2 mb-2 items-center">
                                        <input
                                            type="text"
                                            value={branch.label}
                                            onChange={(e) => handleUpdateBranch(bi, { label: e.target.value })}
                                            placeholder="選択肢ラベル"
                                            className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                        <select
                                            value={branch.action}
                                            onChange={(e) => handleUpdateBranch(bi, { action: e.target.value as FlowBranch['action'] })}
                                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="proceed">次へ進む</option>
                                            <option value="skip_to_step">ステップへジャンプ</option>
                                            <option value="end">フロー終了</option>
                                        </select>
                                        {branch.action === 'skip_to_step' && (
                                            <select
                                                value={branch.targetStepId || ''}
                                                onChange={(e) => handleUpdateBranch(bi, { targetStepId: e.target.value })}
                                                className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            >
                                                <option value="">ジャンプ先を選択</option>
                                                {allSteps.filter(s => s.id !== step.id).map((s, si) => (
                                                    <option key={s.id} value={s.id}>
                                                        {si + 1}. {s.type}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        <button
                                            onClick={() => handleDeleteBranch(bi)}
                                            className="p-2 text-gray-400 hover:text-red-500"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={handleAddBranch}
                                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                >
                                    <PlusIcon /> 選択肢を追加
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 診断 */}
                    {step.type === 'diagnosis' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">診断テンプレート</label>
                            <select
                                value={step.diagnosisTemplateId || ''}
                                onChange={(e) => onUpdate({ ...step, diagnosisTemplateId: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">従来のハードコード診断</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};

// ==============================
// ステップ追加モーダル
// ==============================

interface AddStepModalProps {
    onAdd: (type: FlowStep['type']) => void;
    onClose: () => void;
}

const AddStepModal = ({ onAdd, onClose }: AddStepModalProps) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">ステップを追加</h3>
                <div className="grid grid-cols-2 gap-3">
                    {STEP_TYPES.map(st => (
                        <button
                            key={st.type}
                            onClick={() => { onAdd(st.type); onClose(); }}
                            className="p-4 border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 text-left transition-colors"
                        >
                            <span className="text-2xl">{st.icon}</span>
                            <div className="font-medium text-gray-800 mt-1">{st.label}</div>
                            <div className="text-xs text-gray-500">{st.description}</div>
                        </button>
                    ))}
                </div>
                <button
                    onClick={onClose}
                    className="mt-4 w-full py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    キャンセル
                </button>
            </div>
        </div>
    );
};

// ==============================
// メインコンポーネント
// ==============================

export function FlowBuilder() {
    const [flow, setFlow] = useState<OnboardingFlow>({
        id: 'default',
        name: '友達追加フロー',
        steps: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });
    const [templates, setTemplates] = useState<DiagnosisTemplate[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadTemplates();
        loadDefaultFlow();
    }, []);

    const loadTemplates = async () => {
        const data = await getAvailableDiagnosisTemplates().catch(() => []);
        setTemplates(data);
    };

    const loadDefaultFlow = () => {
        // デフォルトのフローを設定
        const defaultSteps: FlowStep[] = [
            {
                id: 'step_1',
                order: 1,
                type: 'message',
                messageText: '友だち追加ありがとうございます⚽️\n\n簡単な質問に答えるだけで、\nあなたの進路の考え方を整理できます。',
            },
            {
                id: 'step_2',
                order: 2,
                type: 'branch',
                branchQuestion: '診断を始めますか？',
                branches: [
                    { id: 'b1', label: 'はい', action: 'proceed' },
                    { id: 'b2', label: 'スキップ', action: 'skip_to_step', targetStepId: 'step_4' },
                ],
            },
            {
                id: 'step_3',
                order: 3,
                type: 'diagnosis',
                diagnosisTemplateId: '',
            },
            {
                id: 'step_4',
                order: 4,
                type: 'profile_input',
                fieldId: 'name',
                questionText: 'お名前を教えてください',
            },
            {
                id: 'step_5',
                order: 5,
                type: 'profile_input',
                fieldId: 'grade',
                questionText: '学年を選んでください',
            },
        ];
        setFlow(prev => ({ ...prev, steps: defaultSteps }));
    };

    const handleAddStep = (type: FlowStep['type']) => {
        const newStep: FlowStep = {
            id: `step_${Date.now()}`,
            order: flow.steps.length + 1,
            type,
        };

        if (type === 'branch') {
            newStep.branches = [
                { id: 'b1', label: 'はい', action: 'proceed' },
                { id: 'b2', label: 'いいえ', action: 'proceed' },
            ];
        }

        setFlow(prev => ({
            ...prev,
            steps: [...prev.steps, newStep],
        }));
    };

    const handleUpdateStep = (index: number, updatedStep: FlowStep) => {
        const newSteps = [...flow.steps];
        newSteps[index] = updatedStep;
        setFlow(prev => ({ ...prev, steps: newSteps }));
    };

    const handleDeleteStep = (index: number) => {
        setFlow(prev => ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 })),
        }));
    };

    const handleMoveStep = (index: number, direction: 'up' | 'down') => {
        const newSteps = [...flow.steps];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newSteps.length) return;
        [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
        newSteps.forEach((s, i) => { s.order = i + 1; });
        setFlow(prev => ({ ...prev, steps: newSteps }));
    };

    const handleSave = async () => {
        setSaving(true);
        // TODO: APIに保存
        await new Promise(resolve => setTimeout(resolve, 500));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        setSaving(false);
    };

    // メッセージ数計算
    const messageCount = flow.steps.reduce((count, step) => {
        if (step.type === 'message') return count + 1;
        if (step.type === 'profile_input' || step.type === 'question') return count + 1;
        if (step.type === 'branch') return count + 1;
        if (step.type === 'diagnosis') return count + 8; // 診断は約8通
        return count;
    }, 0);

    return (
        <div className="p-6 pb-24">
            {/* ヘッダー */}
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-50/90 backdrop-blur-sm p-4 -mx-6 px-6 z-10 border-b border-gray-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">フロービルダー</h1>
                    <p className="text-gray-500 mt-1">友達追加時のフローを設定</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500 hidden sm:block">
                        予想メッセージ数: <span className="font-bold text-primary-600">{messageCount}通</span>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => setShowPreview(true)}
                        className="flex items-center gap-2"
                    >
                        <PreviewIcon /> プレビュー
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2"
                    >
                        {saving ? '保存中...' : saved ? <><SaveIcon /> 保存しました</> : '保存'}
                    </Button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto">
                {/* ステップ一覧 */}
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
                    <span>ステップ ({flow.steps.length})</span>
                    <span className="text-sm font-normal text-gray-500 sm:hidden">
                        予想: {messageCount}通
                    </span>
                </h2>

                {flow.steps.length === 0 ? (
                    <Card className="p-12 text-center border-dashed border-2 border-gray-300">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                            👋
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">まだステップがありません</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                            新しく友達追加してくれたユーザーに送信するメッセージや、プロフィール収集のフローを作成しましょう。
                        </p>
                        <Button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center gap-2"
                        >
                            <PlusIcon /> 最初のステップを追加
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {flow.steps.map((step, index) => (
                            <StepEditor
                                key={step.id}
                                step={step}
                                index={index}
                                totalSteps={flow.steps.length}
                                allSteps={flow.steps}
                                templates={templates}
                                onUpdate={(s) => handleUpdateStep(index, s)}
                                onDelete={() => handleDeleteStep(index)}
                                onMoveUp={() => handleMoveStep(index, 'up')}
                                onMoveDown={() => handleMoveStep(index, 'down')}
                            />
                        ))}

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="group w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 flex items-center justify-center gap-2 transition-all duration-200"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                                    <PlusIcon />
                                </div>
                                <span className="font-medium">次のステップを追加</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ステップ追加モーダル */}
            {showAddModal && (
                <AddStepModal
                    onAdd={handleAddStep}
                    onClose={() => setShowAddModal(false)}
                />
            )}

            {/* LINEプレビュー (ボトムシート) */}
            <LinePreview
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                steps={flow.steps}
                templates={templates}
            />
        </div>
    );
}
