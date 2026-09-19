import fs from 'fs';
import path from 'path';

export type Language = 'en' | 'es' | 'zh' | 'tr' | 'fr' | 'ku' | 'ar' | 'ru';

export async function getMessages(lang: string) {
  const supportedLangs: Language[] = ['en', 'es', 'zh', 'tr', 'fr', 'ku', 'ar', 'ru'];
  const targetLang = supportedLangs.includes(lang as Language) ? lang : 'en';

  const filePath = path.join(process.cwd(), 'messages', `${targetLang}.json`);
  const fileContents = fs.readFileSync(filePath, 'utf8');

  return JSON.parse(fileContents);
}

export function t(lang: string, key: string, messages: any) {
  return messages?.[key] || key;
}
