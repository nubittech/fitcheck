import { useCallback, useRef } from 'react'

/**
 * useDebounce — prevents a function from being called more than once
 * within `ms` milliseconds. Useful for like/vote/send buttons.
 *
 * Usage:
 *   const handleLike = useDebounce(async () => {
 *     await likeOutfit(...)
 *   }, 800)
 */
export function useDebounce(fn, ms = 800) {
    const timer = useRef(null)
    const pending = useRef(false)

    return useCallback(async (...args) => {
        if (pending.current) return
        pending.current = true

        clearTimeout(timer.current)
        try {
            await fn(...args)
        } finally {
            timer.current = setTimeout(() => {
                pending.current = false
            }, ms)
        }
    }, [fn, ms])
}

/**
 * Simple throttle — fires immediately, then blocks for `ms`.
 * Better for swipe/vote actions where instant feedback matters.
 */
export function useThrottle(fn, ms = 500) {
    const lastRun = useRef(0)

    return useCallback((...args) => {
        const now = Date.now()
        if (now - lastRun.current < ms) return
        lastRun.current = now
        return fn(...args)
    }, [fn, ms])
}
