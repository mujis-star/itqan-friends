import React from 'react';

interface SectionHeaderProps {
  title: React.ReactNode;
  eyebrow?: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  eyebrow, 
  description, 
  align = 'center' 
}) => {
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto'
  }[align];

  return (
    <div className={`max-w-2xl mb-16 ${alignmentClass}`}>
      {eyebrow && (
        <span className="inline-block text-accent font-semibold tracking-wider uppercase text-sm mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
        {title}
      </h2>
      {description && (
        <p className="text-gray-400 text-lg md:text-xl">
          {description}
        </p>
      )}
    </div>
  );
};
