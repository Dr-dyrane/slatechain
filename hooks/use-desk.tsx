import * as React from "react"

const DESK_BREAKPOINT = 1152

export function useIsDesk() {
    const [isDesk, setIsDesk] = React.useState<boolean | undefined>(undefined)

    React.useEffect(() => {
        const mql = window.matchMedia(`(min-width: ${DESK_BREAKPOINT + 1}px)`)
        const onChange = () => {
            setIsDesk(window.innerWidth > DESK_BREAKPOINT)
        }
        mql.addEventListener("change", onChange)
        setIsDesk(window.innerWidth > DESK_BREAKPOINT)
        return () => mql.removeEventListener("change", onChange)
    }, [])

    return !!isDesk
}