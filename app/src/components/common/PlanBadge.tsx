interface PlanBadgeProps {
    plan: 'FREE' | 'BASIC';
    size?: 'sm' | 'md' | 'lg';
}

export function PlanBadge({ plan, size = 'md' }: PlanBadgeProps) {
    const sizeStyles = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };

    if (plan === 'BASIC') {
        return (
            <span
                className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-basic-400 to-basic-500 text-white font-semibold ${sizeStyles[size]}`}
            >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                BASIC
            </span>
        );
    }

    return (
        <span
            className={`inline-flex items-center rounded-full bg-gray-200 text-gray-600 font-medium ${sizeStyles[size]}`}
        >
            FREE
        </span>
    );
}
