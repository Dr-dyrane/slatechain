// components/ui/touchable-opacity.tsx

import React from "react";

interface TouchableOpacityProps extends React.HTMLProps<HTMLDivElement> {
    onClick: () => void;
    className?: string;
}

export const TouchableOpacity: React.FC<TouchableOpacityProps> = ({
    onClick,
    className = "",
    children,
    ...props
}) => {
    return (
        <div
            onClick={onClick}
            className={`transition-opacity hover:opacity-75 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};
