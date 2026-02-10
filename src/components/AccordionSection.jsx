import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function AccordionSection({
  title,
  icon: Icon,
  count,
  defaultOpen = false,
  children,
  className = '',
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`border-b border-gray-100 ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left cursor-pointer group hover:bg-gray-50/50 transition-colors"
      >
        {Icon && <Icon size={14} className="text-gray-400 shrink-0" />}
        <span className="text-sm font-semibold text-gray-600 flex-1">
          {title}
        </span>
        {count !== undefined && (
          <span className="text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
            {count}
          </span>
        )}
        <ChevronDown
          size={14}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${open ? '' : '-rotate-90'}`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-200 ease-in-out"
        style={{
          maxHeight: open ? '2000px' : '0',
          opacity: open ? 1 : 0,
        }}
      >
        <div className="px-4 pb-3">
          {children}
        </div>
      </div>
    </div>
  );
}
