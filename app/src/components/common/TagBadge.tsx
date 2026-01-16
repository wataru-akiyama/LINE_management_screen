interface TagBadgeProps {
    tag: string;
    variant?: 'grade' | 'region' | 'custom' | 'diagnosis';
    size?: 'sm' | 'md';
    onRemove?: () => void;
}

export function TagBadge({ tag, variant = 'custom', size = 'md', onRemove }: TagBadgeProps) {
    const variantStyles = {
        grade: 'bg-blue-100 text-blue-700',
        region: 'bg-purple-100 text-purple-700',
        custom: 'bg-gray-100 text-gray-700',
        diagnosis: 'bg-green-100 text-green-700',
    };

    const sizeStyles = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
    };

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]}`}
        >
            {tag}
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="ml-1 hover:text-gray-900 transition-colors"
                >
                    ×
                </button>
            )}
        </span>
    );
}

// タグリスト
interface TagListProps {
    tags: string[];
    variant?: 'grade' | 'region' | 'custom' | 'diagnosis';
    size?: 'sm' | 'md';
    onRemove?: (tag: string) => void;
    maxDisplay?: number;
}

export function TagList({ tags, variant = 'custom', size = 'md', onRemove, maxDisplay }: TagListProps) {
    const displayTags = maxDisplay ? tags.slice(0, maxDisplay) : tags;
    const remainingCount = maxDisplay ? tags.length - maxDisplay : 0;

    return (
        <div className="flex flex-wrap gap-1">
            {displayTags.map((tag) => (
                <TagBadge
                    key={tag}
                    tag={tag}
                    variant={variant}
                    size={size}
                    onRemove={onRemove ? () => onRemove(tag) : undefined}
                />
            ))}
            {remainingCount > 0 && (
                <span className={`inline-flex items-center rounded-full bg-gray-200 text-gray-600 ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'}`}>
                    +{remainingCount}
                </span>
            )}
        </div>
    );
}
