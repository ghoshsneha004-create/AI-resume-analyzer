import { getAuthToken } from "./auth";
import { ResumeData, AnalysisData, UserProfile } from "@/types/resume";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Set default JSON Content-Type only if not FormData
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred.";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ access_token: string; user: UserProfile }> {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async register(email: string, password: string, full_name?: string): Promise<{ access_token: string; user: UserProfile }> {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name }),
    });
  },

  async getMe(): Promise<UserProfile> {
    return request("/auth/me");
  },

  // Resumes
  async uploadResume(file: File, targetRole?: string): Promise<ResumeData> {
    const formData = new FormData();
    formData.append("file", file);
    if (targetRole) {
      formData.append("target_role", targetRole);
    }
    return request("/resumes/upload", {
      method: "POST",
      body: formData,
    });
  },

  async getResumes(): Promise<ResumeData[]> {
    return request("/resumes/");
  },

  async getResume(id: string): Promise<ResumeData> {
    return request(`/resumes/${id}`);
  },

  // Analysis
  async analyzeResume(resumeId: string, targetRole?: string): Promise<AnalysisData> {
    return request(`/analysis/${resumeId}/analyze`, {
      method: "POST",
      body: JSON.stringify({ target_role: targetRole }),
    });
  },

  async getLatestAnalysis(resumeId: string): Promise<AnalysisData> {
    return request(`/analysis/${resumeId}`);
  },

  async getAnalysisById(analysisId: string): Promise<AnalysisData> {
    return request(`/analysis/id/${analysisId}`);
  },

  // Reports
  getReportDownloadUrl(analysisId: string): string {
    return `${API_BASE_URL}/reports/${analysisId}/download`;
  },
  
  getReportPreviewUrl(analysisId: string): string {
    return `${API_BASE_URL}/reports/${analysisId}/preview`;
  }
};
