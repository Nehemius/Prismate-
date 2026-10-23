import React, { useState, useRef, useEffect, useCallback } from 'react';

interface DraggableEditBannerProps {
  title: string;
  onReset: () => void;
  onDone: () => void;
  storageKey?: string;
}

export const DraggableEditBanner: React.FC<DraggableEditBannerProps> = ({
  title,
  onReset,
  onDone,
  storageKey = 'prismate_edit_banner_pos',
}) => {
  // Initial position: top-right corner
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default: 20px from top, 24px from right
    return {
      x: typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 480) : 600,
      y: 20,
    };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const bannerRef = useRef<HTMLDivElement | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag from banner background or drag handle, not buttons
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;

    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const rect = bannerRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging) return;

    const bannerW = bannerRef.current?.offsetWidth || 440;
    const bannerH = bannerRef.current?.offsetHeight || 44;

    const newX = Math.max(10, Math.min(window.innerWidth - bannerW - 10, e.clientX - dragOffsetRef.current.x));
    const newY = Math.max(10, Math.min(window.innerHeight - bannerH - 10, e.clientY - dragOffsetRef.current.y));

    const newPos = { x: newX, y: newY };
    setPos(newPos);
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(newPos));
    } catch {}
  }, [isDragging, storageKey]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  return (
    <div
      ref={bannerRef}
      className="prismate-draggable-banner"
      onPointerDown={handlePointerDown}
      style={{
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'var(--banner-bg, rgba(18, 18, 22, 0.94))',
        backdropFilter: 'blur(16px)',
        border: isDragging ? '1.5px solid #33F0FF' : '1px solid var(--banner-border, rgba(242, 242, 242, 0.28))',
        borderRadius: '24px',
        padding: '8px 18px',
        boxShadow: isDragging
          ? '0 12px 36px rgba(0, 0, 0, 0.4), 0 0 16px rgba(51, 240, 255, 0.35)'
          : '0 8px 30px var(--banner-shadow, rgba(0, 0, 0, 0.85))',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
        transition: isDragging ? 'none' : 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Drag handle grip */}
      <span
        title="Click and drag to move this box away from buttons underneath"
        style={{
          color: isDragging ? '#33F0FF' : 'var(--banner-grip, rgba(242, 242, 242, 0.45))',
          fontSize: '14px',
          lineHeight: 1,
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        ⠿
      </span>

      <span
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '11px',
          letterSpacing: '1px',
          color: 'var(--banner-text, #F2F2F2)',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </span>

      <button
        onClick={onReset}
        title="Reset layout to default specification"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--banner-muted, rgba(242, 242, 242, 0.55))',
          fontSize: '10px',
          cursor: 'pointer',
          textDecoration: 'underline',
          fontFamily: 'var(--font-subheading)',
          padding: '2px 6px',
        }}
      >
        RESET
      </button>

      <button
        onClick={onDone}
        title="Save changes and exit edit mode"
        style={{
          background: 'var(--banner-btn-bg, #F2F2F2)',
          color: 'var(--banner-btn-fg, #000000)',
          border: 'none',
          borderRadius: '12px',
          padding: '5px 14px',
          fontFamily: 'var(--font-heading)',
          fontSize: '10.5px',
          letterSpacing: '1px',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        }}
      >
        DONE
      </button>
    </div>
  );
};

export default DraggableEditBanner;
