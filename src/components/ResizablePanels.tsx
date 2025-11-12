import { useState, useRef, useCallback, useEffect, ReactNode } from 'react';

interface ResizablePanelsProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  defaultLeftWidth?: number; // percentage (0-100)
  minLeftWidth?: number; // percentage
  maxLeftWidth?: number; // percentage
  showRightPanel?: boolean;
}

export default function ResizablePanels({
  leftPanel,
  rightPanel,
  defaultLeftWidth = 50,
  minLeftWidth = 20,
  maxLeftWidth = 80,
  showRightPanel = true,
}: ResizablePanelsProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Clamp the width between min and max
      const clampedWidth = Math.min(Math.max(newLeftWidth, minLeftWidth), maxLeftWidth);
      setLeftWidth(clampedWidth);
    },
    [isDragging, minLeftWidth, maxLeftWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // If right panel is not shown, left panel takes full width
  if (!showRightPanel) {
    return (
      <div ref={containerRef} className="flex h-full w-full overflow-hidden">
        <div className="h-full w-full overflow-hidden">
          {leftPanel}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden">
      {/* Left Panel */}
      <div 
        className="h-full overflow-hidden flex-shrink-0"
        style={{ width: `${leftWidth}%` }}
      >
        {leftPanel}
      </div>

      {/* Resizer */}
      <div
        className={`h-full flex-shrink-0 cursor-col-resize transition-colors relative group z-10 ${
          isDragging 
            ? 'bg-primary/40' 
            : 'bg-transparent hover:bg-primary/10'
        }`}
        style={{ width: '4px' }}
        onMouseDown={handleMouseDown}
        title="Drag to resize"
      >
        {/* Invisible wider hit area for easier grabbing */}
        <div 
          className="absolute inset-0 cursor-col-resize z-20"
          style={{ 
            left: '-4px', 
            right: '-4px',
            width: '12px'
          }}
          onMouseDown={handleMouseDown}
        />
        {/* Visual line */}
        <div 
          className={`absolute left-1/2 top-0 bottom-0 transform -translate-x-1/2 transition-colors z-10 ${
            isDragging 
              ? 'bg-primary' 
              : 'bg-border group-hover:bg-primary/50'
          }`}
          style={{ width: '2px' }}
        />
      </div>

      {/* Right Panel */}
      <div 
        className="h-full overflow-hidden flex-1"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {rightPanel}
      </div>
    </div>
  );
}