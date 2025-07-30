import {getRequestConfig} from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'pl'];

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale)) {
    // Use default locale if none provided or invalid
    locale = 'en';
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
}); 