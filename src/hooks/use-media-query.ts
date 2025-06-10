import { useState, useEffect } from 'react';

/**
 * メディアクエリに一致するかどうかを判定するカスタムフック
 * @param query - ' (max-width: 768px)' のようなメディアクエリ文字列
 * @returns メディアクエリに一致するかどうかの真偽値
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);

    // Safari < 14 では addEventListener が使えないため、addListener を使用
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      media.addListener(listener); // Deprecated
    }

    // 初回チェック
    listener();

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener); // Deprecated
      }
    };
  }, [query]);

  return matches;
} 