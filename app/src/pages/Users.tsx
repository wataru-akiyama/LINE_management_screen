import { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { UserList } from '../components/users/UserList';
import { UserFiltersComponent } from '../components/users/UserFilters';
import { Button } from '../components/common/Button';
import { getUsers } from '../api/users';
import type { User, UserFilters, Pagination } from '../types';

export function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [filters, setFilters] = useState<UserFilters>({});
    const [isLoading, setIsLoading] = useState(true);
    // const [selectedUser, setSelectedUser] = useState<User | null>(null); // logic removed
    // const [isEditOpen, setIsEditOpen] = useState(false); // logic removed

    // データ取得
    useEffect(() => {
        fetchUsers();
    }, [filters]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const result = await getUsers(filters);
            setUsers(result.users);
            setPagination(result.pagination);
        } catch (error) {
            console.error('ユーザー取得エラー:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserClick = (user: User) => {
        window.open(`/users/${user.userId}`, '_blank');
    };

    const handleFilterChange = (newFilters: UserFilters) => {
        setFilters({ ...newFilters, page: 1 });
    };

    const handleResetFilters = () => {
        setFilters({});
    };

    const handlePageChange = (page: number) => {
        setFilters({ ...filters, page });
    };

    return (
        <div className="min-h-screen">
            <Header
                title="ユーザー管理"
                subtitle={pagination ? `${pagination.total}人のユーザー` : undefined}
            />

            <div className="p-6">
                {/* フィルター */}
                <UserFiltersComponent
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                />

                {/* ユーザーリスト */}
                <UserList users={users} isLoading={isLoading} onUserClick={handleUserClick} />

                {/* ページネーション */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={pagination.page === 1}
                            onClick={() => handlePageChange(pagination.page - 1)}
                        >
                            前へ
                        </Button>
                        <span className="text-sm text-gray-600">
                            {pagination.page} / {pagination.totalPages} ページ
                        </span>
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={pagination.page === pagination.totalPages}
                            onClick={() => handlePageChange(pagination.page + 1)}
                        >
                            次へ
                        </Button>
                    </div>
                )}
            </div>

            {/* ユーザー詳細モーダル (削除済み - 別タブで開くように変更) */}


        </div>
    );
}
