import axios, { type AxiosInstance } from "axios";
import type {
  Sentence,
  Project,
  TranslationRequest,
  TranslationResponse,
  TranslationSuggestion,
  Segment,
  ChunkSentenceRequest,
  ChunkSentenceResponse,
  GenerateSegmentAlternativesRequest,
  GenerateSegmentAlternativesResponse,
} from "../types/translation";

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

  async generateTransSugg(
    projectId: string,
    inputSentence: string,
    previousSentence?: string,
    nextSentence?: string
  ): Promise<TranslationSuggestion[]> {
    const endpoint = "/translation";

    const request: TranslationRequest = {
      project_id: projectId,
      input_sentence: inputSentence,
      previous_sentence: previousSentence,
      next_sentence: nextSentence,
    };

    const response = await this.client.post<TranslationResponse>(
      endpoint,
      request
    );

    // Transform backend response to frontend format with IDs
    return response.data.suggestions.map((text, index) => ({
      id: `suggestion-${Date.now()}-${index}`,
      text: text,
    }));
  }

  async chunkSentence(
    translatedSentence: string,
    language: string = "zh-CN"
  ): Promise<Segment[]> {
    const endpoint = "/chunk-sentence";

    const request: ChunkSentenceRequest = {
      translated_sentence: translatedSentence,
      language: language,
    };

    const response = await this.client.post<ChunkSentenceResponse>(
      endpoint,
      request
    );

    return response.data.segments;
  }

  async generateSegmentAlternatives(
    segmentText: string,
    fullSentence: string,
    position: number,
    language: string = "zh-CN"
  ): Promise<string[]> {
    const endpoint = "/generate-segment-alternatives";

    const request: GenerateSegmentAlternativesRequest = {
      segment_text: segmentText,
      full_sentence: fullSentence,
      segment_position: position,
      language: language,
    };

    const response = await this.client.post<GenerateSegmentAlternativesResponse>(
      endpoint,
      request
    );

    return response.data.alternatives;
  }
}
