import { useState } from 'react';

const cls = (...c) => c.filter(Boolean).join(" ");

export const Card = ({ title, children, right }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-neutral-50 to-neutral-100 hover:from-neutral-100 hover:to-neutral-150 border-b transition-colors"
      >
        <h3 className="font-semibold text-neutral-800">{title}</h3>
        <div className="flex items-center gap-3">
          <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''} text-lg`}>
            ▼
          </span>
          {right}
        </div>
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};

