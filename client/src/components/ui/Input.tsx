import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input = ({ label, className = '', ...props }: InputProps) => {
    return (
        <div className="flex flex-col gap-2 w-full">
            {label && (
                <label className="text-sm font-medium text-muted-foreground ml-1">
                    {label}
                </label>
            )}
            <input
                className={`
          flex h-11 w-full rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent
          disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200
          ${className}
        `}
                {...props}
            />
        </div>
    );
};
