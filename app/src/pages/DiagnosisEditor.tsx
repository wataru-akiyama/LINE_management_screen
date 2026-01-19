import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
    getDiagnosisTemplate,
    createDiagnosisTemplate,
    updateDiagnosisTemplate,
} from '../api/diagnosisTemplates';
import type { DiagnosisTemplate, DiagnosisQuestion, DiagnosisResultType } from '../types';

// アイコンコンポーネント
const ArrowLeftIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

// 質問タイプラベル
const questionTypeLabels: Record<DiagnosisQuestion['type'], string> = {
    single: '単一選択',
    multiple: '複数選択',
    text: 'テキスト入力',
    date: '日付入力',
    region: '地域選択',
};

// 空の質問を作成
const createEmptyQuestion = (order: number): DiagnosisQuestion => ({
    questionId: 'q_' + Date.now() + '_' + order,
    order,
    type: 'single',
    text: '',
    options: [
        { id: 'opt_1', text: 'はい' },
        { id: 'opt_2', text: 'いいえ' },
        { id: 'opt_3', text: 'わからない' },
    ],
    scores: {},
    condition: null,
});

// 空の結果タイプを作成
const createEmptyResultType = (index: number): DiagnosisResultType => ({
    typeId: String.fromCharCode(65 + index), // A, B, C...
    name: '',
    description: '',
    icon: '',
});

// 質問エディターコンポーネント
const QuestionEditor = ({
    question,
    resultTypes,
    onUpdate,
    onDelete,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
}: {
    question: DiagnosisQuestion;
    resultTypes: DiagnosisResultType[];
    onUpdate: (updated: DiagnosisQuestion) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}) => {
    const [expanded, setExpanded] = useState(true);

    const updateOption = (index: number, text: string) => {
        const newOptions = [...question.options];
        newOptions[index] = { ...newOptions[index], text };
        onUpdate({ ...question, options: newOptions });
    };

    const addOption = () => {
        const newOptions = [...question.options, { id: 'opt_' + Date.now(), text: '' }];
        onUpdate({ ...question, options: newOptions });
    };

    const removeOption = (index: number) => {
        const newOptions = question.options.filter((_, i) => i !== index);
        onUpdate({ ...question, options: newOptions });
    };

    const updateScore = (optionId: string, typeId: string, score: number) => {
        const newScores = { ...question.scores };
        if (!newScores[optionId]) {
            newScores[optionId] = {};
        }
        if (score === 0) {
            delete newScores[optionId][typeId];
            if (Object.keys(newScores[optionId]).length === 0) {
                delete newScores[optionId];
            }
        } else {
            newScores[optionId][typeId] = score;
        }
        onUpdate({ ...question, scores: newScores });
    };

    return (
        <Card className="p-4 border-l-4 border-l-primary-500">
            {/* ヘッダー */}
            <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 font-bold rounded-full">
                    {question.order}
                </span>
                <input
                    type="text"
                    value={question.text}
                    onChange={(e) => onUpdate({ ...question, text: e.target.value })}
                    placeholder="質問文を入力..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                />
                <select
                    value={question.type}
                    onChange={(e) => onUpdate({ ...question, type: e.target.value as DiagnosisQuestion['type'] })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                >
                    {Object.entries(questionTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </button>
            </div>

            {expanded && (
                <div className="mt-4 space-y-4">
                    {/* 選択肢（単一・複数選択の場合） */}
                    {(question.type === 'single' || question.type === 'multiple') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">選択肢</label>
                            <div className="space-y-2">
                                {question.options.map((option, index) => (
                                    <div key={option.id} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={option.text}
                                            onChange={(e) => updateOption(index, e.target.value)}
                                            placeholder={`選択肢 ${index + 1}`}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                                        />
                                        {question.options.length > 2 && (
                                            <button
                                                onClick={() => removeOption(index)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                <TrashIcon />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={addOption}
                                className="mt-2 flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                            >
                                <PlusIcon /> 選択肢を追加
                            </button>
                        </div>
                    )}

                    {/* スコアリング設定 */}
                    {resultTypes.length > 0 && (question.type === 'single' || question.type === 'multiple') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">スコアリング</label>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-3 py-2 text-left font-medium text-gray-600">選択肢</th>
                                            {resultTypes.map(rt => (
                                                <th key={rt.typeId} className="px-3 py-2 text-center font-medium text-gray-600">
                                                    {rt.icon} {rt.name || rt.typeId}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {question.options.map(option => (
                                            <tr key={option.id} className="border-t border-gray-200">
                                                <td className="px-3 py-2 text-gray-700">{option.text || '(未入力)'}</td>
                                                {resultTypes.map(rt => (
                                                    <td key={rt.typeId} className="px-3 py-2 text-center">
                                                        <input
                                                            type="number"
                                                            step="0.5"
                                                            value={question.scores[option.id]?.[rt.typeId] ?? 0}
                                                            onChange={(e) => updateScore(option.id, rt.typeId, parseFloat(e.target.value) || 0)}
                                                            className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 bg-white"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* フッター */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                <div className="flex gap-1">
                    <button
                        onClick={onMoveUp}
                        disabled={isFirst}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="上へ移動"
                    >
                        <ChevronUpIcon />
                    </button>
                    <button
                        onClick={onMoveDown}
                        disabled={isLast}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="下へ移動"
                    >
                        <ChevronDownIcon />
                    </button>
                </div>
                <button
                    onClick={onDelete}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                    <TrashIcon /> 削除
                </button>
            </div>
        </Card>
    );
};

// 結果タイプエディターコンポーネント
const ResultTypeEditor = ({
    resultType,
    onUpdate,
    onDelete,
}: {
    resultType: DiagnosisResultType;
    onUpdate: (updated: DiagnosisResultType) => void;
    onDelete: () => void;
}) => {
    return (
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <input
                type="text"
                value={resultType.icon}
                onChange={(e) => onUpdate({ ...resultType, icon: e.target.value })}
                placeholder="🎯"
                className="w-12 px-2 py-2 text-center text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                maxLength={2}
            />
            <div className="flex-1 space-y-2">
                <input
                    type="text"
                    value={resultType.name}
                    onChange={(e) => onUpdate({ ...resultType, name: e.target.value })}
                    placeholder="タイプ名（例: プロ志向型）"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                />
                <textarea
                    value={resultType.description}
                    onChange={(e) => onUpdate({ ...resultType, description: e.target.value })}
                    placeholder="タイプの説明..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none bg-white"
                />
            </div>
            <button
                onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
            >
                <TrashIcon />
            </button>
        </div>
    );
};

export function DiagnosisEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = !id;

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<DiagnosisTemplate['status']>('draft');
    const [questions, setQuestions] = useState<DiagnosisQuestion[]>([]);
    const [resultTypes, setResultTypes] = useState<DiagnosisResultType[]>([]);
    const [activeTab, setActiveTab] = useState<'questions' | 'results'>('questions');

    useEffect(() => {
        if (!isNew && id) {
            fetchTemplate(id);
        }
    }, [id, isNew]);

    const fetchTemplate = async (templateId: string) => {
        setLoading(true);
        try {
            const template = await getDiagnosisTemplate(templateId);
            if (template) {
                setName(template.name);
                setDescription(template.description);
                setStatus(template.status);
                setQuestions(template.questions || []);
                setResultTypes(template.resultTypes || []);
            }
        } catch (err) {
            console.error(err);
            alert('診断の読み込みに失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (newStatus?: DiagnosisTemplate['status']) => {
        setSaving(true);
        try {
            const data: Partial<DiagnosisTemplate> = {
                name,
                description,
                status: newStatus || status,
                questions,
                resultTypes,
            };

            let result;
            if (isNew) {
                result = await createDiagnosisTemplate(data);
            } else {
                result = await updateDiagnosisTemplate(id!, data);
            }

            if (result.success) {
                navigate('/diagnosis');
            } else {
                alert('保存に失敗しました: ' + (result.error?.message || ''));
            }
        } catch (err) {
            console.error(err);
            alert('保存に失敗しました');
        } finally {
            setSaving(false);
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, createEmptyQuestion(questions.length + 1)]);
    };

    const updateQuestion = (index: number, updated: DiagnosisQuestion) => {
        const newQuestions = [...questions];
        newQuestions[index] = updated;
        setQuestions(newQuestions);
    };

    const deleteQuestion = (index: number) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        // orderを再計算
        newQuestions.forEach((q, i) => {
            q.order = i + 1;
        });
        setQuestions(newQuestions);
    };

    const moveQuestion = (index: number, direction: 'up' | 'down') => {
        const newQuestions = [...questions];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
        // orderを再計算
        newQuestions.forEach((q, i) => {
            q.order = i + 1;
        });
        setQuestions(newQuestions);
    };

    const addResultType = () => {
        setResultTypes([...resultTypes, createEmptyResultType(resultTypes.length)]);
    };

    const updateResultType = (index: number, updated: DiagnosisResultType) => {
        const newTypes = [...resultTypes];
        newTypes[index] = updated;
        setResultTypes(newTypes);
    };

    const deleteResultType = (index: number) => {
        setResultTypes(resultTypes.filter((_, i) => i !== index));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* ヘッダー */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/diagnosis')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <ArrowLeftIcon />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isNew ? '新規診断作成' : '診断編集'}
                    </h1>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => handleSave('draft')} disabled={saving}>
                        下書き保存
                    </Button>
                    <Button variant="primary" onClick={() => handleSave('active')} disabled={saving}>
                        {saving ? '保存中...' : '公開'}
                    </Button>
                </div>
            </div>

            {/* 基本情報 */}
            <Card className="p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">基本情報</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">診断名</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="例: 志向性診断"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="診断の説明を入力..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white"
                        />
                    </div>
                </div>
            </Card>

            {/* タブ */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('questions')}
                    className={`px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === 'questions'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    質問 ({questions.length})
                </button>
                <button
                    onClick={() => setActiveTab('results')}
                    className={`px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === 'results'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    結果タイプ ({resultTypes.length})
                </button>
            </div>

            {/* 質問タブ */}
            {activeTab === 'questions' && (
                <div className="space-y-4">
                    {resultTypes.length === 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-4">
                            ⚠️ スコアリングを設定するには、先に「結果タイプ」タブでタイプを追加してください
                        </div>
                    )}
                    {questions.map((question, index) => (
                        <QuestionEditor
                            key={question.questionId}
                            question={question}
                            resultTypes={resultTypes}
                            onUpdate={(updated) => updateQuestion(index, updated)}
                            onDelete={() => deleteQuestion(index)}
                            onMoveUp={() => moveQuestion(index, 'up')}
                            onMoveDown={() => moveQuestion(index, 'down')}
                            isFirst={index === 0}
                            isLast={index === questions.length - 1}
                        />
                    ))}
                    <button
                        onClick={addQuestion}
                        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
                    >
                        <PlusIcon /> 質問を追加
                    </button>
                </div>
            )}

            {/* 結果タイプタブ */}
            {activeTab === 'results' && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-500 mb-4">
                        診断結果として表示されるタイプを設定します。各質問の回答にスコアを設定し、合計スコアが最も高いタイプが結果になります。
                    </p>
                    {resultTypes.map((rt, index) => (
                        <ResultTypeEditor
                            key={rt.typeId}
                            resultType={rt}
                            onUpdate={(updated) => updateResultType(index, updated)}
                            onDelete={() => deleteResultType(index)}
                        />
                    ))}
                    <button
                        onClick={addResultType}
                        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
                    >
                        <PlusIcon /> 結果タイプを追加
                    </button>
                </div>
            )}
        </div>
    );
}
