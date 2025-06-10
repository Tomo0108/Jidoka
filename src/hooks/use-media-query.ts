import { useState, useEffect } from 'react'

/**
 * A hook that provides a boolean value indicating whether a media query is matched.
 * It is SSR-safe and handles hydration mismatches by running only on the client.
 *
 * @param query The media query to match, e.g., '(max-width: 767px)'.
 * @returns `true` if the media query is matched after hydration, otherwise `false`.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Set the initial value on the client after mounting
    setMatches(media.matches)

    // Add the event listener
    media.addEventListener('change', listener)

    // Cleanup the event listener on unmount
    return () => {
      media.removeEventListener('change', listener)
    }
  }, [query]) // Effect runs only once on mount and when query changes

  return matches
} 