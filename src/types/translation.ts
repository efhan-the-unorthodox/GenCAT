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
  { code: 'ja', label: 'Japanese' },
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
  // Backend-specific paths (optional, not used in frontend UI)
  projectPath?: string;
  sentencesPath?: string;
  sourcePath?: string;
  indexPath?: string;
}

export interface LoadProjectResponse {
  sentences: Sentence[];
  project: Project;
}

export interface NewProjectPayload {
  name: string;
  sourceLanguage: string;
  destinationLanguage: string;
  document: File;
  termBase?: File | null;
}

export interface TranslationSuggestion {
  id: string;
  text: string;
}

export interface TranslationRequest {
  project_id: string;
  input_sentence: string;
  previous_sentence?: string;
  next_sentence?: string;
}

export interface TranslationResponse {
  suggestions: string[];
  context_used: string[];
  source_lang: string;
  dest_lang: string;
}

export interface Segment {
  id: string;
  text: string;
  label?: string;                  // POS tag from backend (not displayed in UI)
  originalTokenIds?: string[];     // Track merge history for split functionality
  alternatives?: string[];         // AI-generated alternatives
  showAlternatives?: boolean;      // UI state: dropdown open/closed
  isLoadingAlternatives?: boolean; // UI state: generating alternatives
}

export interface ChunkSentenceRequest {
  translated_sentence: string;
  language?: string;
}

export interface ChunkSentenceResponse {
  segments: Segment[];
  language: string;
}

export interface GenerateSegmentAlternativesRequest {
  segment_text: string;
  full_sentence: string;
  segment_position: number;
  language: string;
}

export interface GenerateSegmentAlternativesResponse {
  alternatives: string[];
  segment_text: string;
}
