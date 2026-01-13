import axios, { type AxiosInstance } from 'axios';
import type { Sentence } from '../types/translation';

interface TranslationRequest {
  document: File;
  sourceLanguage: string;
  destinationLanguage: string;
  termBase?: File | null;
}

export class TranslationService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_TRANSLATION_API_BASE_URL ?? '',
    });
  }

  async requestTranslation({
    document,
    sourceLanguage,
    destinationLanguage,
    termBase,
  }: TranslationRequest): Promise<Sentence[]> {
    const formData = new FormData();
    formData.append('file', document);
    formData.append('sourceLanguage', sourceLanguage);
    formData.append('destinationLanguage', destinationLanguage);
    if (termBase) {
      formData.append('termBase', termBase);
    }

    const endpoint = import.meta.env.VITE_TRANSLATION_ENDPOINT ?? '/translations';
    const response = await this.client.post<Sentence[]>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }
}
