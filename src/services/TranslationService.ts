import axios, { type AxiosInstance } from "axios";
import type { Sentence, Project } from "../types/translation";

interface TextPreprocessingRequest {
  document: File;
  project: Project;
}

export class TranslationService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL:
        import.meta.env.VITE_TRANSLATION_API_BASE_URL ??
        "http://127.0.0.1:8000",
    });
  }

  async textPreprocessing({
    document,
    project,
  }: TextPreprocessingRequest): Promise<Sentence[]> {
    const formData = new FormData();
    formData.append("file", document);
    formData.append("project_id", project.id);
    formData.append("projectName", project.name);
    formData.append("source_lang", project.sourceLanguage);
    formData.append("dest_lang", project.destinationLanguage);
    formData.append("documentName", project.documentName);
    formData.append("dateCreated", project.dateCreated);

    const endpoint = "/preprocessing";
    const response = await this.client.post<Sentence[]>(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  async requestTranslation(sentence: string): Promise<Sentence[]> {
    const endpoint = "/translations";
    const response = await this.client.post<Sentence[]>(endpoint, { sentence });
    return response.data;
  }
}
