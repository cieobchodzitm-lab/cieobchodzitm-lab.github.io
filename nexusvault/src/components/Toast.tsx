import { useCallback, useEffect, useRef, useState } from "react";

export type ToastKind = "ok" | "error" | "info";

export type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
};

const LIFETIME_MS = 4200;

export function useToasts(): {
  toasts: Toast[];
  push: (kind: ToastKind, message: string) => void;
} {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = nextId.current;
    nextId.current += 1;
    setToasts((current) => [...current, { id, kind, message }]);
    const timer = setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, LIFETIME_MS);
    timers.current.push(timer);
  }, []);

  useEffect(
    () => () => {
      for (const timer of timers.current) clearTimeout(timer);
    },
    [],
  );

  return { toasts, push };
}

export function ToastStack({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.kind}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
