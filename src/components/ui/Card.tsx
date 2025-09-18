import React from "react";
import { cn } from "../../utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn("px-6 py-4 border-b border-gray-100", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<
  React.HTMLAttributes<HTMLParagraphElement>
> = ({ children, className, ...props }) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<CardProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn("px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn("px-6 py-4 border-t border-gray-100 bg-gray-50", className)}
      {...props}
    >
      {children}
    </div>
  );
};
