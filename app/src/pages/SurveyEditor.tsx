import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
    getSurvey,
    createSurvey,
    updateSurvey,
} from '../api/surveys';
import type { Survey, SurveyQuestion, SurveyOption } from '../types';

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

// 質問タイプの定義
const QUESTION_TYPES = [
    { value: 'single', label: '単一選択' },
    { value: 'multiple', label: '複数選択' },
    { value: 'text_short', label: 'テキスト（短文）' },
    { value: 'text_long', label: 'テキスト（長文）' },
    { value: 'scale', label: '評価スケール（1〜5）' },
    { value: 'nps', label: 'NPS（0〜10）' },
];

// 質問エディタコンポーネント
const QuestionEditor = ({
    question,
    index,
    totalQuestions,
    onUpdate,
    onDelete,
    onMoveUp,
    onMoveDown,
}: {
    question: SurveyQuestion;
    index: number;
    totalQuestions: number;
    onUpdate: (updated: SurveyQuestion) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}) => {
    const handleAddOption = () => {
        const newOption: SurveyOption = {
            id: `opt_${Date.now()}`,
            text: '',
        };
        onUpdate({
            ...question,
            options: [...question.options, newOption],
        });
    };

    const handleUpdateOption = (optIndex: number, text: string) => {
        const newOptions = [...question.options];
        newOptions[optIndex] = { ...newOptions[optIndex], text };
        onUpdate({ ...question, options: newOptions });
    };

    const handleDeleteOption = (optIndex: number) => {
        const newOptions = question.options.filter((_, i) => i !== optIndex);
        onUpdate({ ...question, options: newOptions });
    };

    const needsOptions = question.type === 'single' || question.type === 'multiple';

    return (
        <Card className="p-4 mb-4">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                    <div className="flex gap-1">
                        <button
                            onClick={onMoveUp}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            title="上に移動"
                        >
                            <ChevronUpIcon />
                        </button>
                        <button
                            onClick={onMoveDown}
                            disabled={index === totalQuestions - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            title="下に移動"
                        >
                            <ChevronDownIcon />
                        </button>
                    </div>
                </div>
                <button
                    onClick={onDelete}
                    className="p-1 text-gray-400 hover:text-red-500"
                    title="削除"
                >
                    <TrashIcon />
                </button>
            </div>

            {/* 質問文 */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">質問文</label>
                <input
                    type="text"
                    value={question.text}
                    onChange={(e) => onUpdate({ ...question, text: e.target.value })}
                    placeholder="質問を入力..."
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>

            {/* 質問タイプ */}
            <div className="mb-4 flex gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">質問タイプ</label>
                    <select
                        value={question.type}
                        onChange={(e) => onUpdate({ ...question, type: e.target.value as SurveyQuestion['type'] })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        {QUESTION_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-end">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(e) => onUpdate({ ...question, required: e.target.checked })}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">必須</span>
                    </label>
                </div>
            </div>

            {/* 選択肢（単一選択・複数選択の場合） */}
            {needsOptions && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">選択肢</label>
                    {question.options.map((opt, optIndex) => (
                        <div key={opt.id} className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => handleUpdateOption(optIndex, e.target.value)}
                                placeholder={`選択肢 ${optIndex + 1}`}
                                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                                onClick={() => handleDeleteOption(optIndex)}
                                className="p-2 text-gray-400 hover:text-red-500"
                                title="削除"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={handleAddOption}
                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                    >
                        <PlusIcon />
                        選択肢を追加
                    </button>
                </div>
            )}

            {/* スケール・NPSのプレビュー */}
            {question.type === 'scale' && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">プレビュー</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(n => (
                            <span key={n} className="px-3 py-1 bg-gray-100 rounded text-sm">{n}</span>
                        ))}
                    </div>
                </div>
            )}

            {question.type === 'nps' && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">プレビュー</label>
                    <div className="flex gap-1 flex-wrap">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                            <span key={n} className="px-2 py-1 bg-gray-100 rounded text-xs">{n}</span>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">0〜6: 批判者 / 7〜8: 中立者 / 9〜10: 推奨者</p>
                </div>
            )}
        </Card>
    );
};

export function SurveyEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = !id || id === 'new';

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isNew && id) {
            loadSurvey(id);
        }
    }, [id, isNew]);

    const loadSurvey = async (surveyId: string) => {
        setLoading(true);
        try {
            const survey = await getSurvey(surveyId);
            if (survey) {
                setTitle(survey.title || '');
                setDescription(survey.description || '');
                setQuestions(survey.questions || []);
            }
        } catch (err) {
            console.error(err);
            alert('アンケートの読み込みに失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = () => {
        const newQuestion: SurveyQuestion = {
            questionId: `q_${Date.now()}_${questions.length + 1}`,
            order: questions.length + 1,
            type: 'single',
            text: '',
            options: [
                { id: 'opt_1', text: '' },
                { id: 'opt_2', text: '' },
            ],
            required: false,
        };
        setQuestions([...questions, newQuestion]);
    };

    const handleUpdateQuestion = (index: number, updated: SurveyQuestion) => {
        const newQuestions = [...questions];
        newQuestions[index] = updated;
        setQuestions(newQuestions);
    };

    const handleDeleteQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
        const newQuestions = [...questions];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newQuestions.length) return;
        [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
        // orderを更新
        newQuestions.forEach((q, i) => { q.order = i + 1; });
        setQuestions(newQuestions);
    };

    const handleSave = async (status: 'draft' | 'active') => {
        if (!title.trim()) {
            alert('タイトルを入力してください');
            return;
        }

        setSaving(true);
        try {
            const data: Partial<Survey> = {
                title,
                description,
                status,
                questions: questions.map((q, i) => ({ ...q, order: i + 1 })),
            };

            let result;
            if (isNew) {
                result = await createSurvey(data);
            } else {
                result = await updateSurvey(id!, data);
            }

            if (result.success && result.data) {
                alert(status === 'active' ? '公開しました！' : '保存しました！');
                navigate('/surveys');
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

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* ヘッダー */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/surveys')}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeftIcon />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isNew ? '新規アンケート作成' : 'アンケート編集'}
                    </h1>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => handleSave('draft')}
                        disabled={saving}
                        className="text-gray-600 border border-gray-300 hover:bg-gray-50"
                    >
                        {saving ? '保存中...' : '下書き保存'}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => handleSave('active')}
                        disabled={saving}
                    >
                        {saving ? '保存中...' : '配信開始'}
                    </Button>
                </div>
            </div>

            {/* 基本情報 */}
            <Card className="p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">基本情報</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="例: サービス満足度アンケート"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="アンケートの説明を入力..."
                            rows={3}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        />
                    </div>
                </div>
            </Card>

            {/* 質問 */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                        質問 ({questions.length})
                    </h2>
                    <Button
                        onClick={handleAddQuestion}
                        className="flex items-center gap-1 text-primary-600 border border-primary-300 hover:bg-primary-50"
                    >
                        <PlusIcon />
                        質問を追加
                    </Button>
                </div>

                {questions.length === 0 ? (
                    <Card className="p-8 text-center">
                        <p className="text-gray-500 mb-4">まだ質問がありません</p>
                        <Button
                            onClick={handleAddQuestion}
                            className="inline-flex items-center gap-1 text-primary-600 border border-primary-300 hover:bg-primary-50"
                        >
                            <PlusIcon />
                            最初の質問を追加
                        </Button>
                    </Card>
                ) : (
                    questions.map((question, index) => (
                        <QuestionEditor
                            key={question.questionId}
                            question={question}
                            index={index}
                            totalQuestions={questions.length}
                            onUpdate={(updated) => handleUpdateQuestion(index, updated)}
                            onDelete={() => handleDeleteQuestion(index)}
                            onMoveUp={() => handleMoveQuestion(index, 'up')}
                            onMoveDown={() => handleMoveQuestion(index, 'down')}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
