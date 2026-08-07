import axios, { AxiosError } from 'axios';
import type { CareerMatch, JDAnalysis, Roadmap, InterviewQuestion } from '@ai4a/shared';
import { AppError } from '../middleware/error.middleware.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';

async function callAIService<T>(path: string, payload: unknown): Promise<T> {
  try {
    const { data } = await axios.post<T>(`${AI_SERVICE_URL}${path}`, payload, {
      timeout: 30000,
    });
    return data;
  } catch (err) {
    const error = err as AxiosError;
    if (error.response) {
      throw new AppError(`AI service error: ${error.response.statusText}`, error.response.status);
    }
    throw new AppError('AI service unavailable', 503);
  }
}

export class AIService {
  isConfigured(): boolean {
    return !!process.env.AI_SERVICE_URL;
  }

  async chat(userId: string, message: string, context?: unknown): Promise<string> {
    const data = await callAIService<{ response: string }>('/chat', { userId, message, context });
    return data.response;
  }

  async analyzeJobDescription(jobDescription: string, userProfile?: unknown): Promise<JDAnalysis> {
    const data = await callAIService<{ analysis: JDAnalysis }>('/analyze-jd', { jobDescription, userProfile });
    return data.analysis;
  }

  async generateRoadmap(userId: string, payload: unknown): Promise<Roadmap> {
    const data = await callAIService<{ roadmap: Roadmap }>('/generate-roadmap', { userId, ...Object(payload) });
    return data.roadmap;
  }

  async suggestCareers(payload: unknown): Promise<CareerMatch[]> {
    const data = await callAIService<{ careers: CareerMatch[] }>('/suggest-careers', payload);
    return data.careers;
  }

  async generateInterviewQuestions(jobType: string, difficulty: string, count: number): Promise<InterviewQuestion[]> {
    const data = await callAIService<{ questions: InterviewQuestion[] }>('/generate-questions', { jobType, difficulty, count });
    return data.questions;
  }

  async getInterviewFeedback(userId: string, responses: unknown[], jobType?: string): Promise<unknown> {
    const data = await callAIService<{ feedback: unknown }>('/feedback', { userId, responses, jobType });
    return data.feedback;
  }
}
