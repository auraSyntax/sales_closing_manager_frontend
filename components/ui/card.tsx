import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    hoverEffect?: 'scale' | 'shadow' | 'border-glow' | 'none';
    variant?: 'default' | 'glass' | 'neumorphic';
  }
>(({ className, hoverEffect = 'shadow', variant = 'default', ...props }, ref) => {
  const baseStyles = cn(
    'bg-card text-card-foreground rounded-xl transition-all duration-300 ease-in-out',
    'border border-opacity-10 overflow-hidden',
    {
      'hover:shadow-lg': hoverEffect === 'shadow',
      'hover:scale-[1.02]': hoverEffect === 'scale',
      'hover:border-primary/30 hover:shadow-primary/10': hoverEffect === 'border-glow',
      'backdrop-blur-sm bg-white/30 border-white/20': variant === 'glass',
      'bg-gradient-to-br from-card to-card-foreground/5 shadow-neumorphic': variant === 'neumorphic',
    },
    className
  );

  return <div ref={ref} className={baseStyles} {...props} />;
});
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { withDivider?: boolean }
>(({ className, withDivider = true, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      'flex flex-col space-y-1.5 p-6',
      withDivider && 'border-b border-border/20 pb-4',
      className
    )} 
    {...props} 
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { gradient?: boolean }
>(({ className, gradient = false, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      gradient && 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground/80', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { withDivider?: boolean }
>(({ className, withDivider = true, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      'flex items-center p-6 pt-0',
      withDivider && 'border-t border-border/20 pt-4',
      className
    )} 
    {...props} 
  />
));
CardFooter.displayName = 'CardFooter';

// Enhanced Stats Card Component
interface CardStatsProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

const CardStats: React.FC<CardStatsProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  trendValue, 
  className 
}) => {
  const trendColors = {
    up: 'text-emerald-500',
    down: 'text-rose-500',
    neutral: 'text-amber-500'
  };

  return (
    <Card 
      className={cn(
        'group relative overflow-hidden transition-all duration-500',
        'hover:shadow-lg hover:border-primary/20',
        className
      )}
    >
      {/* Optional decorative elements */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground/80 uppercase tracking-wider">
              {title}
            </p>
            <div className="text-3xl font-bold mt-2 text-foreground">
              {value}
            </div>
          </div>
          {icon && (
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>

        {(description || trend) && (
          <div className="mt-auto pt-4 border-t border-border/10">
            {description && (
              <p className="text-sm text-muted-foreground/70">
                {description}
              </p>
            )}
            {trend && trendValue && (
              <div className={`flex items-center mt-2 text-sm font-medium ${trendColors[trend]}`}>
                {trend === 'up' ? (
                  <span className="mr-1">↑</span>
                ) : trend === 'down' ? (
                  <span className="mr-1">↓</span>
                ) : (
                  <span className="mr-1">→</span>
                )}
                {trendValue}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardStats };