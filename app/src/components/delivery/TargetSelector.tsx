import { regions, grades, plans } from '../../mocks/data';
import type { DeliveryFilter } from '../../types';

interface TargetSelectorProps {
    filter: DeliveryFilter;
    onChange: (filter: DeliveryFilter) => void;
    estimatedCount?: number;
}

export function TargetSelector({ filter, onChange, estimatedCount }: TargetSelectorProps) {
    const handleChange = (key: keyof DeliveryFilter, value: string) => {
        if (value) {
            onChange({ ...filter, [key]: value });
        } else {
            const newFilter = { ...filter };
            delete newFilter[key];
            onChange(newFilter);
        }
    };

    const hasFilters = Object.keys(filter).length > 0;

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">配信対象</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 学年 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">学年</label>
                    <select
                        value={filter.grade || ''}
                        onChange={(e) => handleChange('grade', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">全学年</option>
                        {grades.map((grade) => (
                            <option key={grade} value={grade}>
                                {grade}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 地域 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">地域</label>
                    <select
                        value={filter.region || ''}
                        onChange={(e) => handleChange('region', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">全地域</option>
                        {regions.map((region) => (
                            <option key={region} value={region}>
                                {region}
                            </option>
                        ))}
                    </select>
                </div>

                {/* プラン */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">プラン</label>
                    <select
                        value={filter.plan || ''}
                        onChange={(e) => handleChange('plan', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">全プラン</option>
                        {plans.map((plan) => (
                            <option key={plan} value={plan}>
                                {plan}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 対象者数表示 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                    <span className="text-sm text-gray-500">配信対象者数:</span>
                    <span className="ml-2 text-lg font-semibold text-primary-600">
                        {estimatedCount !== undefined ? `${estimatedCount}人` : '計算中...'}
                    </span>
                </div>
                {hasFilters && (
                    <button
                        onClick={() => onChange({})}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        フィルターをクリア
                    </button>
                )}
            </div>
        </div>
    );
}
