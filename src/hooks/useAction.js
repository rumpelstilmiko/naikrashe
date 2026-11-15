import { useCallback, useState } from 'react';
import { useToast } from '../store/ToastContext';

export function useAction(action) {
  const [pending, setPending] = useState(false);
  const toast = useToast();

  const run = useCallback(
    async (...args) => {
      setPending(true);
      try {
        return await action(...args);
      } catch (error) {
        toast.error(error.userMessage || 'Не удалось выполнить действие');
        return undefined;
      } finally {
        setPending(false);
      }
    },
    [action, toast],
  );

  return [run, pending];
}
