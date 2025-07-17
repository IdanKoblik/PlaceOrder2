export type Language = 'en' | 'he' | 'ru';

export interface Translation {
  [key: string]: string | Translation;
}