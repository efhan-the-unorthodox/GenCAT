export interface Sentence {
  id: number;
  sourceText: string;
  translation?: string;
  isComplete?: boolean;
}

export interface LanguageOption {
  code: string;
  label: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
];

export interface Project {
  id: string;
  name: string;
  dateCreated: string;
  sourceLanguage: string;
  destinationLanguage: string;
  documentName: string;
  termBaseName?: string;
  lastEdit: string;
}

export interface NewProjectPayload {
  name: string;
  sourceLanguage: string;
  destinationLanguage: string;
  document: File;
  termBase?: File | null;
}
