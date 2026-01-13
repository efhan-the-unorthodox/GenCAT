export interface Sentence {
  id: string;
  sourceText: string;
  translation?: string;
  isComplete?: boolean;
}

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
