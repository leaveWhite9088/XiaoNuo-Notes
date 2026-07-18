import React from 'react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
  to?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  onClick,
  to
}) => {
  const baseStyles = 'bg-bili-card-bg border border-bili-border rounded overflow-hidden';
  const hoverStyles = hoverable ? 'hover:shadow-lg hover:border-bili-pink transition-shadow cursor-pointer' : '';

  const content = (
    <div className={clsx(baseStyles, hoverStyles, className)}>
      {children}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block">
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        {content}
      </div>
    );
  }

  return content;
};