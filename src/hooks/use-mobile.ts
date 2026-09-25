import * as React from "react"

const MOBILE_BREAKPOINT = 768
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

const subscribe = (onStoreChange: () => void) => {
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener("change", onStoreChange)
  return () => mql.removeEventListener("change", onStoreChange)
}

/**
 * The viewport is an external store, so this reads it with
 * `useSyncExternalStore` instead of mirroring it into state from an effect —
 * that pattern renders once with the wrong value and is what
 * `react-hooks/set-state-in-effect` flags. There is no viewport on the server,
 * hence the `false` server snapshot.
 */
export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false
  )
}
