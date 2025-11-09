'use client';

import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface AnimatedTextProps {
  children: string;
  className?: string;
  style?: React.CSSProperties;
  speed?: number; // Characters per second
  onComplete?: () => void;
}

export default function AnimatedText({ 
  children, 
  className = '', 
  style,
  speed = 30,
  onComplete 
}: AnimatedTextProps) {
  const [displayedText, setDisplayedText] = useState(children);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousTextRef = useRef<string>(children);
  const hasAnimatedRef = useRef(false);
  const { shouldAnimate, markAnimationComplete } = useLanguage();
  const mountedRef = useRef(false);

  useEffect(() => {
    // On initial mount, always show text immediately without animation
    if (!mountedRef.current) {
      mountedRef.current = true;
      setDisplayedText(children);
      previousTextRef.current = children;
      // Don't animate on initial mount, even if shouldAnimate is true
      // (this handles the case where user navigates to a new screen after language change)
      return;
    }

    // If text hasn't changed, don't do anything
    if (children === previousTextRef.current) {
      return;
    }

    // Only animate if:
    // 1. Language change triggered animation (shouldAnimate is true)
    // 2. Text actually changed
    // 3. Component was already mounted (not initial mount)
    if (shouldAnimate && children !== previousTextRef.current && mountedRef.current) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Reset displayed text immediately for fade effect
      setIsAnimating(true);
      setDisplayedText('');

      // Start typing animation after a brief delay
      const delay = setTimeout(() => {
        let currentIndex = 0;
        const text = children;

        const animate = () => {
          if (currentIndex < text.length) {
            setDisplayedText(text.slice(0, currentIndex + 1));
            currentIndex++;
            timeoutRef.current = setTimeout(animate, 1000 / speed);
          } else {
            setIsAnimating(false);
            previousTextRef.current = text;
            hasAnimatedRef.current = true;
            
            // Notify that this animation is complete
            markAnimationComplete();
            
            if (onComplete) {
              onComplete();
            }
          }
        };

        animate();
      }, 100); // Small delay before starting to type

      return () => {
        clearTimeout(delay);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    } else {
      // No animation needed - just update the text immediately
      // This handles:
      // - Normal text updates (not language change)
      // - Initial mount of new components
      // - Navigation to new screens
      setDisplayedText(children);
      previousTextRef.current = children;
      hasAnimatedRef.current = false;
    }
  }, [children, speed, onComplete, shouldAnimate, markAnimationComplete]);

  // Reset animation state when shouldAnimate becomes false
  useEffect(() => {
    if (!shouldAnimate && hasAnimatedRef.current) {
      hasAnimatedRef.current = false;
    }
  }, [shouldAnimate]);

  // Don't show cursor if text is fully displayed and not animating
  const showCursor = isAnimating && displayedText.length < children.length;

  return (
    <span 
      className={className}
      style={{
        ...style,
        opacity: isAnimating && displayedText.length === 0 ? 0 : 1,
        transition: 'opacity 0.15s ease-in-out',
        minHeight: '1em',
        display: 'inline-block',
      }}
    >
      {displayedText || '\u00A0'}
      {showCursor && (
        <span 
          className="inline-block w-0.5 h-[1em] ml-0.5 align-baseline"
          style={{
            backgroundColor: 'currentColor',
            animation: 'blink 1s infinite',
            opacity: 0.8,
          }}
        />
      )}
    </span>
  );
}

