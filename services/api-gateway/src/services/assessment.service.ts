import axios from 'axios';
import type { Assessment, Conversation, AssessmentResult } from '../types/shared.js';

export class AssessmentService {
  async createAssessment(userId: string): Promise<Assessment> {
    return {
      id: `assessment_${Date.now()}`,
      userId,
      type: 'initial',
      status: 'in-progress',
      conversations: [],
      results: {
        interests: [],
        skills: [],
        values: [],
        workStyle: {
          type: 'collaborative',
          pace: 'steady',
          environment: [],
          communication: 'async',
        },
        recommendedCareers: [],
      },
      createdAt: new Date(),
      completedAt: null,
    };
  }

  async getAssessment(id: string, userId: string): Promise<Assessment | null> {
    return {
      id,
      userId,
      type: 'initial',
      status: 'in-progress',
      conversations: [],
      results: {
        interests: [],
        skills: [],
        values: [],
        workStyle: {
          type: 'collaborative',
          pace: 'steady',
          environment: [],
          communication: 'async',
        },
        recommendedCareers: [],
      },
      createdAt: new Date(),
      completedAt: null,
    };
  }

  async addMessage(
    assessmentId: string,
    userId: string,
    data: { message: string; extractedData?: any }
  ): Promise<{ assessment: Assessment; response: string }> {
    const conversation: Conversation = {
      id: `conv_${Date.now()}`,
      role: 'user',
      content: data.message,
      timestamp: new Date(),
      extractedData: data.extractedData,
    };

    const aiResponse: Conversation = {
      id: `conv_${Date.now() + 1}`,
      role: 'assistant',
      content: 'I understand. Let me ask you a follow-up question...',
      timestamp: new Date(),
    };

    return {
      assessment: {
        id: assessmentId,
        userId,
        type: 'initial',
        status: 'in-progress',
        conversations: [conversation, aiResponse],
        results: {
          interests: [],
          skills: [],
          values: [],
          workStyle: {
            type: 'collaborative',
            pace: 'steady',
            environment: [],
            communication: 'async',
          },
          recommendedCareers: [],
        },
        createdAt: new Date(),
        completedAt: null,
      },
      response: aiResponse.content,
    };
  }

  async completeAssessment(id: string, userId: string): Promise<Assessment> {
    return {
      id,
      userId,
      type: 'initial',
      status: 'completed',
      conversations: [],
      results: {
        interests: [
          { name: 'Technology', score: 0.85, examples: ['Coding', 'Software'] },
          { name: 'Helping Others', score: 0.75, examples: ['Teaching', 'Mentoring'] },
        ],
        skills: [
          { skill: 'Problem Solving', confidence: 0.9, evidence: ['Projects completed'] },
          { skill: 'Communication', confidence: 0.85, evidence: ['Team collaboration'] },
        ],
        values: ['Growth', 'Impact', 'Flexibility'],
        workStyle: {
          type: 'collaborative',
          pace: 'steady',
          environment: ['remote', 'flexible'],
          communication: 'async',
        },
        recommendedCareers: [
          {
            title: 'Software Developer',
            matchScore: 0.92,
            reasoning: 'Strong technical skills and interest in technology',
            accessibilityScore: 85,
            growthPotential: 90,
            marketDemand: 95,
          },
        ],
      },
      createdAt: new Date(),
      completedAt: new Date(),
    };
  }

  async getAssessmentHistory(userId: string): Promise<Assessment[]> {
    return [];
  }
}
