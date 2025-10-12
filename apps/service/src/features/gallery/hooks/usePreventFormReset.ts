import { useEffect } from "react";

/**
 * React 19で送信後にフォームがリセットされる問題のワークアラウンド
 * @see https://github.com/edmundhung/conform/issues/681
 */
export function usePreventFormReset(formId: string | undefined, onReset?: () => void) {
  useEffect(() => {
    const preventDefault = (event: Event) => {
      if (event.target === document.forms.namedItem(formId ?? "")) {
        event.preventDefault();
        onReset?.();
      }
    };

    document.addEventListener("reset", preventDefault, true);

    return () => {
      document.removeEventListener("reset", preventDefault, true);
    };
  }, [formId, onReset]);
}
