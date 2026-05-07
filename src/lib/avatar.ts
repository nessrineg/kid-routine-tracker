export type AvatarItem = {
  key: string;
  emoji: string;
  label: string;
  bg: [string, string];
};

export const ALL_AVATARS: AvatarItem[] = [
  { key: 'boy-blue',   emoji: '👦',  label: 'ولد',      bg: ['#60A5FA','#2563EB'] },
  { key: 'boy-green',  emoji: '🧒',  label: 'طفل',      bg: ['#34D399','#059669'] },
  { key: 'boy-yellow', emoji: '🤩',  label: 'متحمّس',   bg: ['#FCD34D','#D97706'] },
  { key: 'boy-purple', emoji: '😎',  label: 'رائع',     bg: ['#A78BFA','#7C3AED'] },
  { key: 'boy-red',    emoji: '😄',  label: 'مبتسم',    bg: ['#FCA5A5','#DC2626'] },
  { key: 'boy-teal',   emoji: '🤓',  label: 'ذكي',      bg: ['#5EEAD4','#0D9488'] },
  { key: 'boy-orange', emoji: '😃',  label: 'مرح',      bg: ['#FDBA74','#EA580C'] },
  { key: 'boy-mint',   emoji: '🌿',  label: 'هادئ',     bg: ['#6EE7B7','#059669'] },
  { key: 'boy-navy',   emoji: '😏',  label: 'واثق',     bg: ['#93C5FD','#1E3A8A'] },
  { key: 'boy-coral',  emoji: '😊',  label: 'لطيف',     bg: ['#FCA5A5','#BE123C'] },
  { key: 'boy-sky',    emoji: '🤗',  label: 'مشاغب',    bg: ['#BAE6FD','#0284C7'] },
  { key: 'boy-lime',   emoji: '⚡',  label: 'نشيط',     bg: ['#BEF264','#65A30D'] },
  { key: 'girl-pink',        emoji: '👧',   label: 'بنت',         bg: ['#F9A8D4','#DB2777'] },
  { key: 'girl-purple',      emoji: '🧒‍♀️', label: 'فتاة',       bg: ['#C084FC','#9333EA'] },
  { key: 'girl-star',        emoji: '🥰',   label: 'محبّة',       bg: ['#FDBA74','#EA580C'] },
  { key: 'girl-smile',       emoji: '😊',   label: 'سعيدة',       bg: ['#86EFAC','#16A34A'] },
  { key: 'girl-magic',       emoji: '🤗',   label: 'ودودة',       bg: ['#FDE68A','#CA8A04'] },
  { key: 'girl-cool',        emoji: '😇',   label: 'هادئة',       bg: ['#BAE6FD','#0284C7'] },
  { key: 'girl-hijab-pink',   emoji: '🧕',   label: 'بنت بالحجاب', bg: ['#F9A8D4','#DB2777'] },
  { key: 'girl-hijab-purple', emoji: '🧕',   label: 'فتاة بالحجاب',bg: ['#C084FC','#9333EA'] },
  { key: 'girl-hijab-teal',   emoji: '🧕',   label: 'طالبة',       bg: ['#5EEAD4','#0D9488'] },
  { key: 'girl-hijab-blue',   emoji: '🧕',   label: 'ذكية',        bg: ['#93C5FD','#2563EB'] },
  { key: 'girl-hijab-yellow', emoji: '🧕',   label: 'مشرقة',       bg: ['#FCD34D','#D97706'] },
  { key: 'girl-hijab-orange', emoji: '🧕',   label: 'نشيطة',       bg: ['#FDBA74','#EA580C'] },
  { key: 'lion',        emoji: '🦁',   label: 'أسد',      bg: ['#FCD34D','#B45309'] },
  { key: 'panda',       emoji: '🐼',   label: 'باندا',    bg: ['#A3E635','#4D7C0F'] },
  { key: 'fox',         emoji: '🦊',   label: 'ثعلب',     bg: ['#FB923C','#C2410C'] },
  { key: 'frog',        emoji: '🐸',   label: 'ضفدع',     bg: ['#4ADE80','#15803D'] },
  { key: 'penguin',     emoji: '🐧',   label: 'بطريق',    bg: ['#93C5FD','#1D4ED8'] },
  { key: 'unicorn',     emoji: '🦄',   label: 'يونيكورن', bg: ['#E879F9','#9333EA'] },
  { key: 'koala',       emoji: '🐨',   label: 'كوالا',    bg: ['#94A3B8','#475569'] },
  { key: 'tiger',       emoji: '🐯',   label: 'نمر',      bg: ['#FBBF24','#B45309'] },
  { key: 'bunny',       emoji: '🐰',   label: 'أرنب',     bg: ['#FDA4AF','#BE185D'] },
  { key: 'bear',        emoji: '🐻',   label: 'دب',       bg: ['#D4A574','#92400E'] },
  { key: 'owl',         emoji: '🦉',   label: 'بومة',     bg: ['#6EE7B7','#065F46'] },
  { key: 'cat',         emoji: '🐱',   label: 'قطة',      bg: ['#FDE68A','#92400E'] },
];

export const BOY_SEEDS  = ALL_AVATARS.filter(a => a.key.startsWith('boy')).map(a => a.key);
export const GIRL_SEEDS = ALL_AVATARS.filter(a => a.key.startsWith('girl')).map(a => a.key);

export function getAvatarMeta(key: string): AvatarItem {
  return ALL_AVATARS.find(a => a.key === key) ?? ALL_AVATARS[0];
}

export function getAvatarImageUrl(key: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  return `${base}avatars/${key}.png`;
}

export function isEmojiAvatar(_key: string): boolean {
  return false;
}

export function getAnimalBg(_key: string): string {
  return '#E0E0E0';
}

export function getAvatarUrl(_key: string, _size?: number): string {
  return '';
}
