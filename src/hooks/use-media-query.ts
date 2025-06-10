import { useState, useEffect } from 'react'

/**
 * A hook that provides a boolean value indicating whether a media query is matched.
 * It is SSR-safe and handles hydration mismatches.
 *
 * @param query The media query to match.
 * @returns `true` if the media query is matched, `false` otherwise.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    const listener = () => {
      setMatches(media.matches)
    }

    // This effect runs only on the client, after hydration.
    // So we can safely update the state with the initial value.
    listener()

    media.addEventListener('change', listener)

    return () => {
      media.removeEventListener('change', listener)
    }
  }, [query]) // The effect re-runs only if the query string changes.

  return matches
} 