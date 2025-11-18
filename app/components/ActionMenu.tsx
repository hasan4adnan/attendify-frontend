'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import AnimatedText from './AnimatedText';

export interface ActionMenuItem {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement> | HTMLElement | null;
  position?: 'right' | 'left';
}

export default function ActionMenu({ 
  items, 
  isOpen, 
  onClose, 
  anchorRef, 
  position = 'right' 
}: ActionMenuProps) {
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle mount for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Calculate position and handle ESC key
  useEffect(() => {
    if (!isOpen || !mounted) return;
    
    const anchorElement = anchorRef && ('current' in anchorRef ? anchorRef.current : anchorRef);
    if (!anchorElement) return;

    const updatePosition = () => {
      const element = anchorRef && ('current' in anchorRef ? anchorRef.current : anchorRef);
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const menuWidth = 200; // min-w-[200px]
      const menuHeight = items.length * 44 + 12; // Approximate height (py-1.5 = 6px top + 6px bottom)
      const offset = 8; // mt-1.5 = 6px, rounded to 8px
      
      let left = position === 'right' 
        ? rect.right - menuWidth
        : rect.left;
      
      // Ensure menu doesn't go off-screen horizontally
      if (left < 8) left = 8;
      if (left + menuWidth > window.innerWidth - 8) {
        left = window.innerWidth - menuWidth - 8;
      }
      
      // Calculate top position
      let top = rect.bottom + offset;
      
      // If menu would go off-screen at bottom, show above the button
      if (top + menuHeight > window.innerHeight - 8) {
        top = rect.top - menuHeight - offset;
        // If still off-screen at top, position at bottom of viewport
        if (top < 8) {
          top = window.innerHeight - menuHeight - 8;
        }
      }
      
      setMenuPosition({
        top: top,
        left: left
      });
    };

    updatePosition();

    // Handle ESC key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Handle scroll/resize
    const handleScroll = () => {
      updatePosition();
    };

    window.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, anchorRef, position, mounted, onClose, items.length]);

    // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const anchorElement = anchorRef && ('current' in anchorRef ? anchorRef.current : anchorRef);
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        anchorElement &&
        !anchorElement.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    // Use capture phase to catch clicks before they bubble
    document.addEventListener('mousedown', handleClickOutside, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [isOpen, anchorRef, onClose]);

  if (!isOpen || items.length === 0 || !mounted || typeof document === 'undefined') return null;

  const menuContent = (
    <>
      {/* Backdrop - transparent overlay for click detection */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
        style={{ backgroundColor: 'transparent' }}
      />
      
      {/* Menu */}
      <div
        ref={menuRef}
        className="fixed z-[9999] backdrop-blur-2xl rounded-xl border py-1.5 min-w-[200px]"
        style={{
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`,
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--border-primary)',
          animation: 'slideInFromTop 200ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((item, index) => {
          const isDanger = item.variant === 'danger';
          const iconColor = isDanger 
            ? '#ef4444' 
            : item.id === 'manualFaceScan' 
              ? '#0046FF' 
              : item.id.includes('email') 
                ? '#FF8040' 
                : '#0046FF';
          
          return (
            <React.Fragment key={item.id}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  item.onClick();
                  onClose();
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-medium transition-all duration-200 first:rounded-t-lg last:rounded-b-lg relative"
                style={{
                  color: isDanger ? '#ef4444' : 'var(--text-primary)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDanger 
                    ? 'rgba(239, 68, 68, 0.1)' 
                    : 'var(--bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Icon */}
                <div 
                  className="flex-shrink-0 w-5 h-5 flex items-center justify-center"
                  style={{ color: iconColor }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                
                {/* Label */}
                <span className="flex-1 text-left min-w-0">
                  <AnimatedText speed={40}>
                    {item.label}
                  </AnimatedText>
                </span>
              </button>
              
              {/* Divider (except for last item) */}
              {index < items.length - 1 && (
                <div
                  className="h-px mx-3 my-0.5"
                  style={{ backgroundColor: 'var(--border-primary)' }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );

  // Render via portal to document.body
  if (typeof document !== 'undefined' && document.body) {
    return createPortal(menuContent, document.body);
  }
  
  return null;
}
