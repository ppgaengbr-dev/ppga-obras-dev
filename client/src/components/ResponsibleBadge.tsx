import React from 'react';

interface ResponsibleBadgeProps {
  name: string;
  className?: string;
}

export const ResponsibleBadge: React.FC<ResponsibleBadgeProps> = ({ name, className = "" }) => {
  if (!name) return null;
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-medium ${className}`}>
      {name}
    </span>
  );
};
