import { useState, useEffect } from 'react';
import type { FlowStep, DiagnosisTemplate } from '../../types';

interface LinePreviewProps {
    isOpen: boolean;
    onClose: () => void;
    steps: FlowStep[];
    templates: DiagnosisTemplate[];
}

// ==============================
// アイコン・アセット
// ==============================
// LINEのデフォルトアイコンの代わり
const UserIcon = () => (
    <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
        <img
            src="https://placehold.co/100x100/333333/ffffff?text=OA"
            alt="Account"
            className="w-full h-full object-cover"
        />
    </div>
);

// ==============================
// メッセージコンポーネント
// ==============================

// テキストメッセージ (Message Bubble)
const TextMessage = ({ text }: { text: string }) => (
    <div className="flex gap-2 max-w-[85%]">
        <UserIcon />
        <div>
            <div className="text-[10px] text-gray-500 mb-1 ml-1">公式アカウント</div>
            <div className="bg-white p-3 rounded-2xl rounded-tl-none text-sm text-[#111111] shadow-sm whitespace-pre-wrap leading-relaxed relative bubble-tail">
                {text}
            </div>
        </div>
    </div>
);

// ボタンテンプレート (Buttons Template)
// 画像なし、タイトル、テキスト、アクションボタン
const ButtonTemplate = ({ title, text, actions }: { title?: string, text: string, actions: { label: string }[] }) => (
    <div className="flex gap-2 max-w-[85%]">
        <UserIcon />
        <div>
            <div className="text-[10px] text-gray-500 mb-1 ml-1">公式アカウント</div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 w-[240px]">
                {/* テキストエリア */}
                <div className="p-3">
                    {title && <div className="font-bold text-sm mb-1">{title}</div>}
                    <div className="text-sm text-gray-600 leading-snug">{text}</div>
                </div>
                {/* アクションボタンエリア */}
                <div className="divide-y divide-gray-100 border-t border-gray-100">
                    {actions.map((action, i) => (
                        <div key={i} className="h-10 flex items-center justify-center text-sm font-bold text-[#4E6FBB] hover:bg-gray-50 cursor-pointer active:bg-gray-100 transition-colors">
                            {action.label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

// カルーセルテンプレート (Carousel Template)
// 診断用
const DiagnosisCarousel = ({ templateName }: { templateName: string }) => (
    <div className="flex gap-2 w-full overflow-hidden">
        <UserIcon />
        <div className="flex-1 min-w-0">
            <div className="text-[10px] text-gray-500 mb-1 ml-1">公式アカウント</div>
            {/* カルーセルコンテナ */}
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x pr-4">
                {/* カード1: 診断開始 */}
                <div className="flex-shrink-0 w-[240px] bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 snap-center">
                    <div className="h-[120px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                        🎯 志向性診断
                    </div>
                    <div className="p-3">
                        <div className="font-bold text-sm mb-1">{templateName}</div>
                        <div className="text-xs text-gray-500">あなたの進路選びのアドバイスを作成します</div>
                    </div>
                    <div className="h-10 border-t border-gray-100 flex items-center justify-center text-sm font-bold text-[#4E6FBB]">
                        診断を始める
                    </div>
                </div>
                {/* カード2: 詳細 */}
                <div className="flex-shrink-0 w-[240px] bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 snap-center">
                    <div className="h-[120px] bg-gray-100 flex items-center justify-center text-gray-400 text-3xl">
                        ℹ️
                    </div>
                    <div className="p-3">
                        <div className="font-bold text-sm mb-1">診断について</div>
                        <div className="text-xs text-gray-500">所要時間は約3分です。</div>
                    </div>
                    <div className="h-10 border-t border-gray-100 flex items-center justify-center text-sm font-bold text-[#4E6FBB]">
                        詳しく見る
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// クイックリプライ (Quick Reply)
// 画面下部にチップを表示
const QuickReply = ({ options }: { options: string[] }) => (
    <div className="flex gap-2 overflow-x-auto pb-2 px-4 mt-2">
        {options.map((opt, i) => (
            <div key={i} className="flex-shrink-0 h-8 px-4 bg-white rounded-full border border-[#4E6FBB] text-[#4E6FBB] text-sm font-medium flex items-center justify-center shadow-sm whitespace-nowrap">
                {opt}
            </div>
        ))}
    </div>
);


// ==============================
// メインコンポーネント (Bottom Sheet)
// ==============================

export function LinePreview({ isOpen, onClose, steps, templates }: LinePreviewProps) {
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            setCurrentTime(`${hours}:${minutes}`);
        };
        updateTime();
        const timer = setInterval(updateTime, 60000);
        return () => clearInterval(timer);
    }, []);

    // プレビュー用にステップをレンダリングできる形に変換
    const renderSteps = () => {
        return steps.map((step, index) => {
            const isLast = index === steps.length - 1;

            return (
                <div key={step.id} className="space-y-4 mb-4">
                    {/* メッセージタイプ */}
                    {step.type === 'message' && step.messageText && (
                        <TextMessage text={step.messageText} />
                    )}

                    {/* 分岐質問（ボタンテンプレート） */}
                    {step.type === 'branch' && (
                        <ButtonTemplate
                            text={step.branchQuestion || '質問'}
                            actions={(step.branches || []).map(b => ({ label: b.label || '選択肢' }))}
                        />
                    )}

                    {/* プロフィール入力 */}
                    {step.type === 'profile_input' && (
                        <div className="space-y-2">
                            {/* 質問メッセージ */}
                            <TextMessage text={step.questionText || '質問'} />

                            {/* 選択肢（ボタンまたはクイックリプライ） */}
                            {step.inputType === 'buttons' && step.options && (
                                isLast ? (
                                    // 最後ならクイックリプライとして表示（入力待ち感）
                                    <div className="absolute bottom-[80px] left-0 w-full z-10 pointer-events-none">
                                        <QuickReply options={step.options} />
                                    </div>
                                ) : (
                                    // 過去ログなら自分の回答として表示（簡易的にテキスト）
                                    <div className="flex justify-end px-4">
                                        <div className="bg-[#85E249] p-2 px-3 rounded-2xl rounded-tr-none text-sm text-black max-w-[80%] shadow-sm">
                                            {step.options[0]} (サンプル)
                                        </div>
                                    </div>
                                )
                            )}
                            {/* テキスト入力なら */}
                            {step.inputType === 'text' && !isLast && (
                                <div className="flex justify-end px-4">
                                    <div className="bg-[#85E249] p-2 px-3 rounded-2xl rounded-tr-none text-sm text-black max-w-[80%] shadow-sm">
                                        サンプル回答
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 診断（カルーセル） */}
                    {step.type === 'diagnosis' && (
                        <DiagnosisCarousel
                            templateName={templates.find(t => t.id === step.diagnosisTemplateId)?.name || '基本診断'}
                        />
                    )}
                </div>
            );
        });
    };

    return (
        <>
            {/* オーバーレイ */}
            <div
                className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* サイドピーク（右側スライドイン） */}
            <div
                className={`fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-white z-50 shadow-2xl transition-transform duration-300 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* LINE画面コンテナ */}
                <div className="h-full bg-[#111] w-full relative overflow-hidden flex flex-col">
                    {/* ステータスバー */}
                    <div className="h-12 bg-gray-900 text-white flex justify-between items-center px-6 text-sm font-medium z-10 shrink-0">
                        <span>{currentTime}</span>
                        <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z" />
                            </svg>
                            <span className="text-xs">5G</span>
                            <div className="w-5 h-2.5 border border-white rounded-[2px] relative">
                                <div className="absolute inset-0.5 bg-white w-[80%]" />
                            </div>
                        </div>
                    </div>

                    {/* アプリヘッダー */}
                    <div className="h-14 bg-[#212b36] flex items-center px-4 text-white z-10 shadow-md shrink-0">
                        <button onClick={onClose} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="ml-2 font-bold text-lg">公式アカウント</div>
                        <div className="ml-auto space-x-4 flex">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </div>
                    </div>

                    {/* トークエリア (スクロール可能) */}
                    <div className="flex-1 bg-[#7494C0] overflow-y-auto p-4 pb-20">
                        {renderSteps()}
                    </div>

                    {/* フッター (入力エリア) */}
                    <div className="h-[80px] bg-white border-t border-gray-200 flex items-center px-3 gap-2 absolute bottom-0 w-full z-20 pb-6 shrink-0">
                        <div className="p-2">
                            <svg className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div className="p-2">
                            <svg className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            </svg>
                        </div>
                        <div className="p-2">
                            <svg className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="flex-1 h-9 bg-gray-100 rounded-full flex items-center px-4 text-gray-400 text-sm">
                            メッセージを入力
                        </div>
                        <div className="p-2">
                            <svg className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
