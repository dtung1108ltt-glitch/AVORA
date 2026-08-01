import type { InterviewSession, InterviewQuestion, InterviewResponse, InterviewFeedback } from '../types/shared.js';

export class InterviewService {
  async getUserInterviews(userId: string): Promise<InterviewSession[]> {
    return [];
  }

  async createInterview(userId: string, data: any): Promise<InterviewSession> {
    const session: InterviewSession = {
      id: `interview_${Date.now()}`,
      userId,
      targetJobId: data.targetJobId || '',
      config: {
        types: data.config?.types || ['behavioral', 'situational'],
        difficulty: data.config?.difficulty || 'medium',
        questionCount: data.config?.questionCount || 5,
        timePerQuestion: data.config?.timePerQuestion || 120,
        allowPause: true,
        includeFollowUp: true,
      },
      status: 'setup',
      questions: [],
      currentQuestionIndex: 0,
      responses: [],
      feedback: null,
      settings: {
        accommodations: [],
        startTime: new Date(),
        duration: 0,
        pauses: [],
      },
      createdAt: new Date(),
      completedAt: null,
    };

    return session;
  }

  async getInterviewById(id: string, userId: string): Promise<InterviewSession | null> {
    return {
      id,
      userId,
      targetJobId: 'target_1',
      config: {
        types: ['behavioral', 'situational'],
        difficulty: 'medium',
        questionCount: 5,
        timePerQuestion: 120,
        allowPause: true,
        includeFollowUp: true,
      },
      status: 'in-progress',
      questions: [
        {
          id: 'q_1',
          text: 'Tell me about a time when you had to overcome a challenge.',
          type: 'behavioral',
          difficulty: 'medium',
          followUpQuestions: ['What was the outcome?', 'What did you learn?'],
          expectedPoints: ['Problem identification', 'Solution approach', 'Results'],
          scoringCriteria: ['Clarity', 'Specificity', 'Reflection'],
        },
      ],
      currentQuestionIndex: 0,
      responses: [],
      feedback: null,
      settings: {
        accommodations: [],
        startTime: new Date(),
        duration: 0,
        pauses: [],
      },
      createdAt: new Date(),
      completedAt: null,
    };
  }

  async getNextQuestion(interviewId: string, userId: string): Promise<InterviewQuestion | null> {
    return {
      id: `q_${Date.now()}`,
      text: 'Describe a situation where you had to work with a difficult team member.',
      type: 'behavioral',
      difficulty: 'medium',
      followUpQuestions: ['How did you handle it?', 'What was the result?'],
      expectedPoints: ['Communication', 'Problem-solving', 'Teamwork'],
      scoringCriteria: ['Specificity', 'Actions taken', 'Learning'],
    };
  }

  async submitResponse(
    interviewId: string,
    userId: string,
    data: { questionId: string; response: string; audioUrl?: string }
  ): Promise<{ response: InterviewResponse; feedback: any }> {
    const response: InterviewResponse = {
      questionId: data.questionId,
      response: data.response,
      audioUrl: data.audioUrl,
      feedback: {
        score: 8,
        strengths: ['Good specific example', 'Clear communication'],
        improvements: ['Could add more reflection'],
      },
      timestamp: new Date(),
    };

    return {
      response,
      feedback: {
        score: 8,
        strengths: ['Good specific example'],
        improvements: ['Could add more reflection'],
      },
    };
  }

  async pauseInterview(interviewId: string, userId: string): Promise<InterviewSession> {
    const interview = await this.getInterviewById(interviewId, userId);
    if (!interview) throw new Error('Interview not found');

    return {
      ...interview,
      status: 'paused',
      settings: {
        ...interview.settings,
        pauses: [...interview.settings.pauses, { pausedAt: new Date() }],
      },
    };
  }

  async resumeInterview(interviewId: string, userId: string): Promise<InterviewSession> {
    const interview = await this.getInterviewById(interviewId, userId);
    if (!interview) throw new Error('Interview not found');

    return {
      ...interview,
      status: 'in-progress',
    };
  }

  async completeInterview(interviewId: string, userId: string): Promise<InterviewSession> {
    const interview = await this.getInterviewById(interviewId, userId);
    if (!interview) throw new Error('Interview not found');

    const feedback: InterviewFeedback = {
      overallScore: 8,
      categories: [
        { name: 'Communication', score: 8, feedback: 'Clear and articulate' },
        { name: 'Specificity', score: 7, feedback: 'Good examples provided' },
        { name: 'Confidence', score: 8, feedback: 'Confident delivery' },
      ],
      strengths: [
        'Strong examples from past experience',
        'Good communication skills',
        'Shows self-awareness',
      ],
      improvements: [
        'Could provide more quantifiable results',
        'Consider STAR format more consistently',
      ],
      disabilityDisclosureAdvice: {
        shouldDisclose: 'optional',
        timing: 'After receiving offer or during interview',
        script: 'I want to discuss workplace accommodations that would help me perform at my best...',
      },
      nextSteps: [
        'Practice with more STAR-format answers',
        'Research the company culture',
        'Prepare questions for the interviewer',
      ],
    };

    return {
      ...interview,
      status: 'completed',
      feedback,
      completedAt: new Date(),
    };
  }

  async getFeedback(interviewId: string, userId: string): Promise<InterviewFeedback | null> {
    return {
      overallScore: 8,
      categories: [
        { name: 'Communication', score: 8, feedback: 'Clear and articulate' },
      ],
      strengths: ['Strong examples'],
      improvements: ['Could quantify results'],
      disabilityDisclosureAdvice: null,
      nextSteps: ['Practice more'],
    };
  }
}
