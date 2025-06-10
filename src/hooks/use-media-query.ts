import { useEffect, useState } from 'react'

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
    
    // Set the initial state
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = () => {
      setMatches(media.matches)
    }

    // Add listener
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', listener)
    } else {
      media.addListener(listener) // For older browsers
    }

    // Cleanup listener on unmount
    return () => {
      if (typeof media.removeEventListener === 'function') {
        media.removeEventListener('change', listener)
      } else {
        media.removeListener(listener) // For older browsers
      }
    }
  }, [matches, query])

  return matches
} 