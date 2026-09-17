"use client";

import { useEffect } from "react";

type ToastNotificationProps = {
  message: string;
  onDismiss: () => void;
};

export function ToastNotification({ message, onDismiss }: ToastNotificationProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 4200);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  return <div className="toast-notification" role="status" aria-live="polite"><span className="toast-indicator" /><span className="toast-message">{message}</span><button type="button" onClick={onDismiss} aria-label="Dismiss notification">×</button></div>;
}
