import axios, { type AxiosInstance } from "axios";
import type { Project, LoadProjectResponse } from "../types/translation";

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

  async loadProject(id: string): Promise<LoadProjectResponse> {
    const response = await this.client.post<LoadProjectResponse>("/load_project", {
      project_id: id,
    });
    return response.data;
  }

  async deleteProject(id: string): Promise<{ status: string; project_id: string }> {
    const response = await this.client.post<{ status: string; project_id: string }>(
      "/delete_project",
      { project_id: id }
    );
    return response.data;
  }
}
