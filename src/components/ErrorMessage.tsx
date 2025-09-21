import React from 'react';
import styles from './ErrorMessage.module.scss';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  onDismiss 
}) => {
  return (
    <div className={styles.errorContainer} role="alert">
      <div className={styles.errorIcon}>⚠️</div>
      <div className={styles.errorContent}>
        <h3 className={styles.errorTitle}>Something went wrong</h3>
        <p className={styles.errorMessage}>{message}</p>
        <div className={styles.errorActions}>
          {onRetry && (
            <button 
              className={styles.retryButton}
              onClick={onRetry}
              aria-label="Retry the operation"
            >
              Try Again
            </button>
          )}
          {onDismiss && (
            <button 
              className={styles.dismissButton}
              onClick={onDismiss}
              aria-label="Dismiss error message"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
