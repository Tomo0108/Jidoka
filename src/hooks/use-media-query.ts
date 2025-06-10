import { useState, useEffect } from 'react';

/**
 * メディアクエリに一致するかどうかを判定するカスタムフック（SSR/ハイドレーション対応）
 * @param query - ' (max-width: 768px)' のようなメディアクエリ文字列
 * @returns メディアクエリに一致するかどうかの真偽値
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    
    // Safari < 14 and other older browsers
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      media.addListener(listener);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [matches, query]);

  return matches;
} 