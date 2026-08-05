// Shared types for API Gateway

// ============ AUTH TYPES ============
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

// ============ ASSESSMENT TYPES ============
export interface Assessment {
  id: string;
  user_id: string;
  status: 'active' | 'completed';
  started_at: string;
  completed_at?: string;
  current_step: number;
  total_steps: number;
  conversation?: Conversation[];
  result?: AssessmentResult;
}

export interface Conversation {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface AssessmentResult {
  id: string;
  assessment_id: string;
  summary: string;
  skills: string[];
  suggested_roles: string[];
  confidence_score: number;
  created_at: string;
}

// ============ JOB TYPES ============
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  salary_range?: string;
  description: string;
  requirements: string[];
  benefits?: string[];
  accessibility_features?: string[];
  posted_date: string;
  source_url?: string;
  logo?: string;
}

export interface JobSearchParams {
  query?: string;
  location?: string;
  type?: string;
  accessibility_features?: string[];
  page?: number;
  limit?: number;
}

export interface JDAnalysis {
  job_id?: string;
  summary: string;
  key_requirements: string[];
  accessibility_insights: string[];
  skill_gaps: string[];
  suggested_improvements: string[];
  overall_score: number;
}

// ============ ROADMAP TYPES ============
export interface Roadmap {
  id: string;
  user_id: string;
  title: string;
  target_role: string;
  description?: string;
  phases: RoadmapPhase[];
  created_at: string;
  updated_at: string;
  progress: number;
}

export interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  order: number;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completed_at?: string;
  learning_items: LearningItem[];
}

export interface LearningItem {
  id: string;
  title: string;
  type: 'article' | 'video' | 'course' | 'practice';
  url?: string;
  completed: boolean;
}

// ============ INTERVIEW TYPES ============
export interface InterviewSession {
  id: string;
  user_id: string;
  job_id?: string;
  target_role: string;
  status: 'preparing' | 'active' | 'paused' | 'completed';
  current_question_index: number;
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  started_at: string;
  completed_at?: string;
  feedback?: InterviewFeedback;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  tips?: string[];
}

export interface InterviewResponse {
  id: string;
  question_id: string;
  response: string;
  audio_url?: string;
  recorded_at: string;
  analysis?: {
    score: number;
    feedback: string;
    improvements: string[];
  };
}

export interface InterviewFeedback {
  overall_score: number;
  strengths: string[];
  areas_for_improvement: string[];
  detailed_feedback: Record<string, {
    score: number;
    feedback: string;
  }>;
  recommendations: string[];
  created_at: string;
}

// ============ AI TYPES ============
export interface CareerMatch {
  role: string;
  match_score: number;
  reasons: string[];
  accessibility_features: string[];
  growth_potential: string;
}

// ============ PARTNER TYPES ============
export interface Partner {
  id: string;
  name: string;
  logo: string;
  website: string;
  description: string;
  contact_email?: string;
  partnership_type: 'corporate' | 'nonprofit' | 'government' | 'education';
  accessibility_commitments: string[];
  created_at: string;
}
