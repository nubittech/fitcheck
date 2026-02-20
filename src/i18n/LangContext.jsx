import React, { createContext, useContext, useState, useCallback } from 'react'
import { translations } from './translations'

const LangContext = createContext(null)

export function LangProvider({ children }) {
    const [lang, setLang] = useState(() => {
        return localStorage.getItem('fitcheck_lang') || 'tr'
    })

    const toggleLang = useCallback(() => {
        setLang(prev => {
            const next = prev === 'en' ? 'tr' : 'en'
            localStorage.setItem('fitcheck_lang', next)
            return next
        })
    }, [])

    const t = useCallback((key) => {
        return translations[lang]?.[key] ?? translations['en']?.[key] ?? key
    }, [lang])

    return (
        <LangContext.Provider value={{ lang, toggleLang, t }}>
            {children}
        </LangContext.Provider>
    )
}

export function useLang() {
    return useContext(LangContext)
}
