"use client";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Globe, ChevronDown } from "lucide-react";

const LanguageSwitcher = () => {
    const [locale, setLocale] = useState<string>("en");
    const [isOpen, setIsOpen] = useState(false);
    const t = useTranslations();

    useEffect(() => {
        const cookieLocale = document.cookie
            .split("; ")
            .find((row) => row.startsWith("SALES_CLOSE_MANAGE_LOCALE="))
            ?.split("=")[1];

        if (cookieLocale) {
            setLocale(cookieLocale);
        } else {
            const browserLocale = navigator.language.slice(0, 2);
            // Default to French if browser language is French, otherwise English
            const defaultLocale = browserLocale === 'fr' ? 'fr' : 'en';
            setLocale(defaultLocale);
            document.cookie = `SALES_CLOSE_MANAGE_LOCALE=${defaultLocale}; path=/; max-age=31536000`; // 1 year
        }
    }, []);

    const changeLocale = (newLocale: string) => {
        setLocale(newLocale);
        document.cookie = `SALES_CLOSE_MANAGE_LOCALE=${newLocale}; path=/; max-age=31536000`; // 1 year
        setIsOpen(false);
        // Reload the page to apply the new language
        window.location.reload();
    }

    const getLanguageLabel = (lang: string) => {
        return lang === 'en' ? t('language.en') : t('language.fr');
    };

    const getLanguageFlag = (lang: string) => {
        return lang === 'en' ? '🇺🇸' : '🇫🇷';
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-700/30 hover:from-slate-700/50 hover:to-slate-600/30 transition-all duration-300 border border-slate-700/50 hover:border-slate-600/50 group"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-700/50 text-slate-400 group-hover:bg-slate-600 group-hover:text-slate-200 transition-all duration-300">
                        <Globe className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{getLanguageFlag(locale)}</span>
                        <span className="text-sm font-medium text-white">{getLanguageLabel(locale)}</span>
                    </div>
                </div>
                <ChevronDown 
                    className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                    }`} 
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700/50 shadow-2xl z-50 overflow-hidden">
                    <div className="py-2">
                        {/* English Option */}
                        <button
                            onClick={() => changeLocale('en')}
                            className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                                locale === 'en' 
                                    ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white' 
                                    : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                            }`}
                        >
                            <span className="text-lg">🇺🇸</span>
                            <span className="text-sm font-medium">English</span>
                            {locale === 'en' && (
                                <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full"></div>
                            )}
                        </button>

                        {/* French Option */}
                        <button
                            onClick={() => changeLocale('fr')}
                            className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                                locale === 'fr' 
                                    ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white' 
                                    : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                            }`}
                        >
                            <span className="text-lg">🇫🇷</span>
                            <span className="text-sm font-medium">Français</span>
                            {locale === 'fr' && (
                                <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full"></div>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Backdrop to close dropdown */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default LanguageSwitcher; 