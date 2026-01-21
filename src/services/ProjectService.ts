import axios, { type AxiosInstance } from "axios";
import type { Project, Sentence } from "../types/translation";

export class ProjectService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL:
        import.meta.env.VITE_TRANSLATION_API_BASE_URL ??
        "http://127.0.0.1:8000",
    });
  }

  async getProjects(): Promise<Project[]> {
    const response = await this.client.post<Project[]>("/projects");
    return response.data;
  }

  async getSentences(id: string): Promise<Sentence[]> {
    const response = await this.client.get<Sentence[]>("/sentences", {
      params: { id: id },
    });
    return response.data;
  }
}
