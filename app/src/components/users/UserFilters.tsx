import { Button } from '../common/Button';
import { regions, grades, plans } from '../../mocks/data';
import type { UserFilters } from '../../types';

interface UserFiltersProps {
    filters: UserFilters;
    onFilterChange: (filters: UserFilters) => void;
    onReset: () => void;
}

const SearchIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

export function UserFiltersComponent({ filters, onFilterChange, onReset }: UserFiltersProps) {
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange({ ...filters, search: e.target.value });
    };

    const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange({ ...filters, grade: e.target.value || undefined });
    };

    const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange({ ...filters, region: e.target.value || undefined });
    };

    const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange({ ...filters, plan: e.target.value || undefined });
    };

    const hasActiveFilters = filters.search || filters.grade || filters.region || filters.plan || filters.status;

    return (
        <div className="bg-white rounded-xl p-4 card-shadow mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* 検索 */}
                <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="名前、チーム名、LINE IDで検索..."
                        value={filters.search || ''}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
                    />
                </div>

                {/* フィルター */}
                <div className="flex flex-wrap gap-3">
                    <select
                        value={filters.grade || ''}
                        onChange={handleGradeChange}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
                    >
                        <option value="">全学年</option>
                        {grades.map((grade) => (
                            <option key={grade} value={grade}>
                                {grade}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.region || ''}
                        onChange={handleRegionChange}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
                    >
                        <option value="">全地域</option>
                        {regions.map((region) => (
                            <option key={region} value={region}>
                                {region}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.plan || ''}
                        onChange={handlePlanChange}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
                    >
                        <option value="">全プラン</option>
                        {plans.map((plan) => (
                            <option key={plan} value={plan}>
                                {plan}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.status || ''}
                        onChange={(e) => onFilterChange({ ...filters, status: e.target.value || undefined })}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
                    >
                        <option value="">全ステータス</option>
                        <option value="unread">未対応</option>
                        <option value="in_progress">対応中</option>
                        <option value="done">対応済</option>
                    </select>

                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={onReset}>
                            クリア
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
