import { useState } from 'react';
import type { ActivityHeatmapData } from '../../types';
import { format, subDays, startOfWeek, addDays } from 'date-fns';
import { ja } from 'date-fns/locale';

interface ActivityHeatmapProps {
    data: ActivityHeatmapData[];
    weeks?: number;
}

const levelColors = [
    'bg-gray-100',        // level 0
    'bg-emerald-200',     // level 1
    'bg-emerald-400',     // level 2
    'bg-emerald-500',     // level 3
    'bg-emerald-700',     // level 4
];

const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];

export function ActivityHeatmap({ data, weeks = 13 }: ActivityHeatmapProps) {
    const [tooltip, setTooltip] = useState<{
        visible: boolean;
        x: number;
        y: number;
        date: string;
        count: number
    }>({
        visible: false,
        x: 0,
        y: 0,
        date: '',
        count: 0
    });

    // データをマップに変換
    const dataMap = new Map<string, ActivityHeatmapData>();
    data.forEach(d => dataMap.set(d.date, d));

    // 過去N週間分のデータを生成
    const today = new Date();
    const startDate = startOfWeek(subDays(today, weeks * 7), { weekStartsOn: 0 });

    // 週ごとにグループ化
    const weekColumns: Date[][] = [];
    let currentDate = startDate;

    for (let w = 0; w < weeks; w++) {
        const week: Date[] = [];
        for (let d = 0; d < 7; d++) {
            week.push(new Date(currentDate));
            currentDate = addDays(currentDate, 1);
        }
        weekColumns.push(week);
    }

    const handleMouseEnter = (
        e: React.MouseEvent<HTMLDivElement>,
        date: Date,
        count: number
    ) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            visible: true,
            x: rect.left + rect.width / 2,
            y: rect.top - 40,
            date: format(date, 'yyyy年M月d日(E)', { locale: ja }),
            count
        });
    };

    const handleMouseLeave = () => {
        setTooltip(prev => ({ ...prev, visible: false }));
    };

    return (
        <div className="relative">
            <div className="flex gap-0.5">
                {/* 曜日ラベル */}
                <div className="flex flex-col gap-0.5 pr-2 text-xs text-gray-400">
                    {dayLabels.map((label, i) => (
                        <div key={i} className="h-3 w-6 flex items-center justify-end">
                            {i % 2 === 1 ? label : ''}
                        </div>
                    ))}
                </div>

                {/* ヒートマップグリッド */}
                <div className="flex gap-0.5 overflow-x-auto">
                    {weekColumns.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-0.5">
                            {week.map((date, dayIndex) => {
                                const dateStr = format(date, 'yyyy-MM-dd');
                                const cellData = dataMap.get(dateStr);
                                const level = cellData?.level ?? 0;
                                const count = cellData?.count ?? 0;
                                const isFuture = date > today;

                                return (
                                    <div
                                        key={dayIndex}
                                        className={`h-3 w-3 rounded-sm cursor-pointer transition-transform hover:scale-125 ${isFuture
                                            ? 'bg-gray-50'
                                            : levelColors[level]
                                            }`}
                                        onMouseEnter={(e) => handleMouseEnter(e, date, count)}
                                        onMouseLeave={handleMouseLeave}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* 凡例 */}
            <div className="flex items-center justify-end gap-1 mt-3 text-xs text-gray-500">
                <span>少</span>
                {levelColors.map((color, i) => (
                    <div
                        key={i}
                        className={`h-3 w-3 rounded-sm ${color}`}
                    />
                ))}
                <span>多</span>
            </div>

            {/* ツールチップ */}
            {tooltip.visible && (
                <div
                    className="fixed z-50 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg pointer-events-none transform -translate-x-1/2"
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    <div className="font-medium">{tooltip.date}</div>
                    <div className="text-gray-300">{tooltip.count} アクティビティ</div>
                </div>
            )}
        </div>
    );
}
