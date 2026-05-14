/**
 * @file I18n Provider — wraps app with i18next and handles RTL direction.
 * Must be rendered inside the client boundary.
 */

'use client';

import { useEffect } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '@/i18n';

function DirectionHandler({ children }: { children: React.ReactNode }) {
  const { i18n: i18nInstance } = useTranslation();

  useEffect(() => {
    const dir = i18nInstance.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', i18nInstance.language);
  }, [i18nInstance.language]);

  return <>{children}</>;
}

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <DirectionHandler>{children}</DirectionHandler>
    </I18nextProvider>
  );
}
