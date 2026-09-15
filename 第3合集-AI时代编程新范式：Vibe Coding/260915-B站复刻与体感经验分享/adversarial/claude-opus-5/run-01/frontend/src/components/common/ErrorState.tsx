import { Icon } from './Icon';
import './ErrorState.css';

interface ErrorStateProps {
  title?: string;
  error?: unknown;
  onRetry?: () => void;
  compact?: boolean;
}

/** 接口失败时的统一错误态（后端未启动 / 网络异常），带重试 */
export function ErrorState({ title = '内容加载失败', error, onRetry, compact }: ErrorStateProps) {
  const detail = error instanceof Error ? error.message : '';
  return (
    <div className={`error-state ${compact ? 'error-state--compact' : ''}`} role="alert">
      <Icon name="tv" size={compact ? 28 : 44} className="error-state__icon" />
      <p className="error-state__title">{title}</p>
      <p className="error-state__detail">
        {detail || '请确认后端服务 (127.0.0.1:5602) 已启动，然后重试。'}
      </p>
      {onRetry && (
        <button type="button" className="error-state__retry" onClick={onRetry}>
          <Icon name="refresh" size={14} /> 重试
        </button>
      )}
    </div>
  );
}
