import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export const useLocalizedNavigation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lang = searchParams.get('lang') || 'en';

  const getLocalizedPath = useCallback((path: string) => {
    if (lang === 'en') return path;
    const separator = path.includes('?') ? '&' : '?';
    return `${path}${separator}lang=${lang}`;
  }, [lang]);

  const navigateLocalized = useCallback((path: string) => {
    navigate(getLocalizedPath(path));
  }, [navigate, getLocalizedPath]);

  return { lang, getLocalizedPath, navigateLocalized };
};
