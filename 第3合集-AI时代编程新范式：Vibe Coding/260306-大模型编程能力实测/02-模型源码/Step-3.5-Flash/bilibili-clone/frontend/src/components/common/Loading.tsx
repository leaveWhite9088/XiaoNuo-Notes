import React from 'react';
import clsx from 'clsx';

interface LoadingProps {
  size?: 'sm' | 'mid' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'mid',
  text = '加载中...',
  fullScreen = false
}) => {
  const sizes = { sm: 'w-4 h-4 border-2', mid: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={clsx('animate-spin rounded-full border-bili-pink border-t-transparent', sizes[size])}></div>
      {text && <span className="text-bili-text-gray text-sm">{text}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};