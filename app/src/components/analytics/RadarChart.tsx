import { useMemo } from 'react';
import type { UserAbilityStats } from '../../types';

interface RadarChartProps {
    stats: UserAbilityStats;
    size?: number;
}

const LABELS = [
    { key: 'engagement', label: '熱量' },
    { key: 'learningDrive', label: '学習意欲' },
    { key: 'responsiveness', label: '反応速度' },
    { key: 'loyalty', label: '愛着度' },
    { key: 'communication', label: '発信力' },
] as const;

export function RadarChart({ stats, size = 280 }: RadarChartProps) {
    const center = size / 2;
    const radius = size / 2 - 40;
    const angleStep = (2 * Math.PI) / LABELS.length;

    // グリッドの同心円を生成
    const gridCircles = useMemo(() => {
        return [0.2, 0.4, 0.6, 0.8, 1].map((scale) => ({
            r: radius * scale,
            label: `${scale * 100}`,
        }));
    }, [radius]);

    // 軸の線とラベル位置を計算
    const axes = useMemo(() => {
        return LABELS.map((item, i) => {
            const angle = -Math.PI / 2 + i * angleStep;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            const labelX = center + (radius + 25) * Math.cos(angle);
            const labelY = center + (radius + 25) * Math.sin(angle);
            return { ...item, x, y, labelX, labelY, angle };
        });
    }, [center, radius, angleStep]);

    // データポイントのパスを生成
    const dataPath = useMemo(() => {
        const points = LABELS.map((item, i) => {
            const value = stats[item.key as keyof UserAbilityStats] / 100;
            const angle = -Math.PI / 2 + i * angleStep;
            const x = center + radius * value * Math.cos(angle);
            const y = center + radius * value * Math.sin(angle);
            return `${x},${y}`;
        });
        return `M ${points.join(' L ')} Z`;
    }, [stats, center, radius, angleStep]);

    // データポイントの座標
    const dataPoints = useMemo(() => {
        return LABELS.map((item, i) => {
            const value = stats[item.key as keyof UserAbilityStats] / 100;
            const angle = -Math.PI / 2 + i * angleStep;
            return {
                key: item.key,
                value: stats[item.key as keyof UserAbilityStats],
                x: center + radius * value * Math.cos(angle),
                y: center + radius * value * Math.sin(angle),
            };
        });
    }, [stats, center, radius, angleStep]);

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} className="overflow-visible">
                {/* 背景グリッド */}
                {gridCircles.map((circle, i) => (
                    <circle
                        key={i}
                        cx={center}
                        cy={center}
                        r={circle.r}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth={1}
                    />
                ))}

                {/* 軸線 */}
                {axes.map((axis) => (
                    <line
                        key={axis.key}
                        x1={center}
                        y1={center}
                        x2={axis.x}
                        y2={axis.y}
                        stroke="#d1d5db"
                        strokeWidth={1}
                    />
                ))}

                {/* データエリア */}
                <path
                    d={dataPath}
                    fill="rgba(99, 102, 241, 0.3)"
                    stroke="#6366f1"
                    strokeWidth={2}
                    className="transition-all duration-500"
                />

                {/* データポイント */}
                {dataPoints.map((point) => (
                    <circle
                        key={point.key}
                        cx={point.x}
                        cy={point.y}
                        r={5}
                        fill="#6366f1"
                        stroke="#fff"
                        strokeWidth={2}
                        className="transition-all duration-500"
                    />
                ))}

                {/* ラベル */}
                {axes.map((axis) => (
                    <text
                        key={axis.key}
                        x={axis.labelX}
                        y={axis.labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs font-medium fill-gray-700"
                    >
                        {axis.label}
                    </text>
                ))}
            </svg>

            {/* 数値表示 */}
            <div className="mt-4 grid grid-cols-5 gap-2 text-center w-full">
                {dataPoints.map((point) => (
                    <div key={point.key} className="flex flex-col">
                        <span className="text-lg font-bold text-primary-600">{point.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
