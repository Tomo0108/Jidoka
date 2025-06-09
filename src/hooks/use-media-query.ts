import { useState, useEffect } from 'react';

/**
 * メディアクエリに一致するかどうかを判定するカスタムフック
 * @param query - ' (max-width: 768px)' のようなメディアクエリ文字列
 * @returns メディアクエリに一致するかどうかの真偽値
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // windowオブジェクトが存在しないサーバーサイドでは何もしない
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia(query);
    
    // 初回レンダリング時に状態を更新
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => {
      setMatches(media.matches);
    };

    // イベントリスナーを追加
    // Safari < 14 では addEventListener が使えないため、addListener を使用
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      media.addListener(listener);
    }

    return () => {
      // イベントリスナーを削除
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [matches, query]);

  return matches;
}; 