/**
 * HMAX-Lite: Page Transition Component - Enterprise Edition
 * ==========================================================
 * 
 * Smooth page transitions and loading states with
 * enterprise-grade animations.
 */

import { useState, useEffect, type ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  isLoading?: boolean;
  loadingComponent?: ReactNode;
}

export function PageTransition({ 
  children, 
  isLoading = false,
  loadingComponent 
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation after mount
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading && loadingComponent) {
    return (
      <div className="animate-fade-in">
        {loadingComponent}
      </div>
    );
  }

  return (
    <div
      className={`
        transition-all duration-500 ease-out
        ${isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4'
        }
      `}
    >
      {children}
    </div>
  );
}

/**
 * Staggered children animation wrapper
 */
interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerContainer({ 
  children, 
  staggerDelay = 50,
  className = '' 
}: StaggerContainerProps) {
  return (
    <div 
      className={className}
      style={{
        '--stagger-delay': `${staggerDelay}ms`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  index: number;
  className?: string;
}

export function StaggerItem({ children, index, className = '' }: StaggerItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 50);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={`
        transition-all duration-300 ease-out
        ${isVisible 
          ? 'opacity-100 translate-x-0' 
          : 'opacity-0 -translate-x-4'
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * Fade transition wrapper
 */
interface FadeTransitionProps {
  children: ReactNode;
  show: boolean;
  duration?: number;
  className?: string;
}

export function FadeTransition({ 
  children, 
  show, 
  duration = 300,
  className = '' 
}: FadeTransitionProps) {
  return (
    <div
      className={`
        transition-opacity ease-in-out
        ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        ${className}
      `}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Slide transition wrapper
 */
interface SlideTransitionProps {
  children: ReactNode;
  show: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  className?: string;
}

export function SlideTransition({ 
  children, 
  show, 
  direction = 'right',
  duration = 300,
  className = '' 
}: SlideTransitionProps) {
  const directionStyles = {
    left: show ? 'translate-x-0' : '-translate-x-full',
    right: show ? 'translate-x-0' : 'translate-x-full',
    up: show ? 'translate-y-0' : '-translate-y-full',
    down: show ? 'translate-y-0' : 'translate-y-full',
  };

  return (
    <div
      className={`
        transition-transform ease-out
        ${directionStyles[direction]}
        ${className}
      `}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Scale transition wrapper
 */
interface ScaleTransitionProps {
  children: ReactNode;
  show: boolean;
  duration?: number;
  className?: string;
}

export function ScaleTransition({ 
  children, 
  show, 
  duration = 200,
  className = '' 
}: ScaleTransitionProps) {
  return (
    <div
      className={`
        transition-all ease-out origin-center
        ${show 
          ? 'opacity-100 scale-100' 
          : 'opacity-0 scale-95 pointer-events-none'
        }
        ${className}
      `}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Loading overlay with spinner
 */
interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ 
  isLoading, 
  message = 'Loading...',
  className = '' 
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div 
      className={`
        absolute inset-0 z-50
        flex flex-col items-center justify-center
        bg-scada-bg/80 backdrop-blur-sm
        animate-fade-in
        ${className}
      `}
    >
      <div className="relative w-16 h-16 mb-4">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-scada-border/30 rounded-full" />
        
        {/* Spinning ring */}
        <div className="absolute inset-0 border-4 border-status-info border-t-transparent rounded-full animate-spin" />
        
        {/* Inner ring (reverse spin) */}
        <div 
          className="absolute inset-2 border-4 border-status-normal/30 border-b-transparent rounded-full animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        />
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-status-info rounded-full animate-pulse" />
        </div>
      </div>
      
      <p className="text-sm text-scada-muted font-mono animate-pulse">
        {message}
      </p>
    </div>
  );
}

/**
 * Progress bar with animation
 */
interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  color?: string;
}

export function ProgressBar({ 
  progress, 
  className = '',
  showPercentage = false,
  color = '#00ff9d'
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      <div className="h-2 bg-scada-border/30 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${clampedProgress}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}50`,
          }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-scada-muted font-mono">0%</span>
          <span className="text-[10px] font-mono" style={{ color }}>
            {clampedProgress.toFixed(0)}%
          </span>
          <span className="text-[10px] text-scada-muted font-mono">100%</span>
        </div>
      )}
    </div>
  );
}

export default PageTransition;
