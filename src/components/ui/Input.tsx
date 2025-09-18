import React, { forwardRef } from "react";
import { cn } from "../../utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  textarea?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, textarea = false, ...props }, ref) => {
    const inputClasses = cn(
      "block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors",
      !!icon && "pl-10",
      error && "border-red-300 focus:border-red-500 focus:ring-red-500",
      className
    );

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && !textarea && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400">{icon}</div>
            </div>
          )}
          {textarea ? (
            <textarea
              className={inputClasses}
              rows={4}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input className={inputClasses} ref={ref} {...props} />
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
