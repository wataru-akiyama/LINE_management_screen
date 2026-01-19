import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { getSurvey, getSurveyResponses, getSurveyStats } from '../api/surveys';
import type { Survey, SurveyResponse, SurveyStats } from '../types';

// アイコンコンポーネント
const ArrowLeftIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

// シンプルな棒グラフコンポーネント
const BarChart = ({
    data,
    options
}: {
    data: Record<string, number>;
    options?: { id: string; text: string }[];
}) => {
    const entries = Object.entries(data);
    if (entries.length === 0) return <p className="text-gray-500 text-sm">回答なし</p>;

    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    const maxCount = Math.max(...entries.map(([, count]) => count));

    // オプションIDからテキストへのマッピング
    const getLabel = (key: string) => {
        if (options) {
            const opt = options.find(o => o.id === key);
            return opt ? opt.text : key;
        }
        return key;
    };

    return (
        <div className="space-y-2">
            {entries.map(([key, count]) => {
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                const width = maxCount > 0 ? (count / maxCount) * 100 : 0;

                return (
                    <div key={key} className="flex items-center gap-3">
                        <div className="w-24 text-sm text-gray-700 truncate" title={getLabel(key)}>
                            {getLabel(key)}
                        </div>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary-500 rounded-full transition-all duration-300"
                                style={{ width: `${width}%` }}
                            />
                        </div>
                        <div className="w-16 text-right text-sm text-gray-600">
                            {count}件 ({percentage}%)
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// NPS スコア表示コンポーネント
const NPSDisplay = ({ data }: { data: Record<string, number> }) => {
    let detractors = 0; // 0-6
    let passives = 0; // 7-8
    let promoters = 0; // 9-10

    Object.entries(data).forEach(([key, count]) => {
        const score = parseInt(key);
        if (score <= 6) detractors += count;
        else if (score <= 8) passives += count;
        else promoters += count;
    });

    const total = detractors + passives + promoters;
    const npsScore = total > 0
        ? Math.round(((promoters - detractors) / total) * 100)
        : 0;

    return (
        <div className="space-y-4">
            <div className="text-center">
                <span className="text-4xl font-bold text-gray-800">{npsScore}</span>
                <span className="text-lg text-gray-500 ml-1">NPS</span>
            </div>
            <div className="flex gap-4 text-sm">
                <div className="flex-1 text-center p-2 bg-red-50 rounded-lg">
                    <div className="text-red-600 font-semibold">{detractors}</div>
                    <div className="text-red-500 text-xs">批判者 (0-6)</div>
                </div>
                <div className="flex-1 text-center p-2 bg-yellow-50 rounded-lg">
                    <div className="text-yellow-600 font-semibold">{passives}</div>
                    <div className="text-yellow-500 text-xs">中立者 (7-8)</div>
                </div>
                <div className="flex-1 text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-green-600 font-semibold">{promoters}</div>
                    <div className="text-green-500 text-xs">推奨者 (9-10)</div>
                </div>
            </div>
        </div>
    );
};

export function SurveyResponses() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [survey, setSurvey] = useState<Survey | null>(null);
    const [responses, setResponses] = useState<SurveyResponse[]>([]);
    const [stats, setStats] = useState<SurveyStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'stats' | 'responses'>('stats');

    useEffect(() => {
        if (id) {
            loadData(id);
        }
    }, [id]);

    const loadData = async (surveyId: string) => {
        setLoading(true);
        try {
            const [surveyData, responsesData, statsData] = await Promise.all([
                getSurvey(surveyId),
                getSurveyResponses(surveyId),
                getSurveyStats(surveyId),
            ]);

            setSurvey(surveyData);
            setResponses(responsesData?.responses ?? []);
            setStats(statsData);
        } catch (err) {
            console.error(err);
            alert('データの読み込みに失敗しました');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!survey) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500">アンケートが見つかりません</p>
                <Link to="/surveys" className="text-primary-600 hover:underline mt-4 inline-block">
                    一覧に戻る
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* ヘッダー */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/surveys')}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeftIcon />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{survey.title}</h1>
                        <p className="text-gray-500 mt-1">回答: {responses.length}件</p>
                    </div>
                </div>
            </div>

            {/* タブ */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('stats')}
                    className={`pb-3 px-2 font-medium text-sm transition-colors ${activeTab === 'stats'
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    集計結果
                </button>
                <button
                    onClick={() => setActiveTab('responses')}
                    className={`pb-3 px-2 font-medium text-sm transition-colors ${activeTab === 'responses'
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    回答一覧
                </button>
            </div>

            {/* コンテンツ */}
            {activeTab === 'stats' ? (
                <div className="space-y-6">
                    {responses.length === 0 ? (
                        <Card className="p-8 text-center">
                            <p className="text-gray-500">まだ回答がありません</p>
                        </Card>
                    ) : (
                        stats?.questions.map((qStats, index) => {
                            const question = survey.questions?.find(q => q.questionId === qStats.questionId);

                            return (
                                <Card key={qStats.questionId} className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                        Q{index + 1}. {qStats.text}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        回答数: {qStats.totalAnswers}件
                                    </p>

                                    {qStats.type === 'nps' ? (
                                        <NPSDisplay data={qStats.breakdown} />
                                    ) : qStats.type === 'text_short' || qStats.type === 'text_long' ? (
                                        <p className="text-gray-500 text-sm">テキスト回答は「回答一覧」タブで確認できます</p>
                                    ) : (
                                        <BarChart
                                            data={qStats.breakdown}
                                            options={question?.options}
                                        />
                                    )}
                                </Card>
                            );
                        })
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {responses.length === 0 ? (
                        <Card className="p-8 text-center">
                            <p className="text-gray-500">まだ回答がありません</p>
                        </Card>
                    ) : (
                        responses.map((response) => (
                            <Card key={response.responseId} className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <span className="text-sm font-medium text-gray-800">
                                            {response.userId}
                                        </span>
                                        <span className="text-sm text-gray-500 ml-2">
                                            {new Date(response.submittedAt).toLocaleString('ja-JP')}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {survey.questions?.map((question, index) => {
                                        const answer = response.answers[question.questionId];
                                        const answerText = Array.isArray(answer)
                                            ? answer.map(a => {
                                                const opt = question.options?.find(o => o.id === a);
                                                return opt ? opt.text : a;
                                            }).join(', ')
                                            : (question.options?.find(o => o.id === answer)?.text || answer);

                                        return (
                                            <div key={question.questionId} className="flex gap-2 text-sm">
                                                <span className="text-gray-500 shrink-0">Q{index + 1}:</span>
                                                <span className="text-gray-700">{answerText ?? '-'}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
