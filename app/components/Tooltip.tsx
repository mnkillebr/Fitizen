import React, { useState, useRef } from 'react';
import clsx from 'clsx';

interface TooltipProps {
  children: React.ReactNode;
  label: string;
  className?: string;
  relativePosition?: string;
  delay?: number;
}

interface TimeoutRef extends HTMLDivElement {
  timeoutId?: ReturnType<typeof setTimeout>;
}

const Tooltip = ({
  children,
  label,
  className = "bg-primary text-foreground",
  relativePosition = "-top-4.5 left-4.5",
  delay = 500,
}: TooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<TimeoutRef>(null);

  const handleMouseEnter = () => {
    const timeoutId = setTimeout(() => {
      setShowTooltip(true);
    }, delay);

    if (tooltipRef.current) {
      tooltipRef.current.timeoutId = timeoutId;
    }
  };

  const handleMouseLeave = () => {
    if (tooltipRef.current && tooltipRef.current.timeoutId) {
      clearTimeout(tooltipRef.current.timeoutId);
    }
    setShowTooltip(false);
  };

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {showTooltip && (
        <div
          ref={tooltipRef}
          className={clsx(
            "absolute z-10 px-2 py-1 rounded-md shadow-md",
            relativePosition,
            className
          )}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default Tooltip;