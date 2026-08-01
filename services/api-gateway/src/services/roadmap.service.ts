import type { Roadmap, RoadmapPhase, Milestone, LearningItem } from '../types/shared.js';

export class RoadmapService {
  async getUserRoadmaps(userId: string): Promise<Roadmap[]> {
    return [];
  }

  async createRoadmap(userId: string, data: any): Promise<Roadmap> {
    const roadmap: Roadmap = {
      id: `roadmap_${Date.now()}`,
      userId,
      targetJobId: data.targetJobId,
      title: data.title,
      description: 'Your personalized learning path',
      currentSkills: [],
      gapSkills: [],
      phases: [
        {
          id: `phase_${Date.now()}`,
          name: 'Foundation',
          description: 'Build your foundational skills',
          order: 1,
          milestones: [],
          estimatedDuration: 40,
        },
      ],
      settings: {
        weeklyHours: data.settings?.weeklyHours || 10,
        preferredPace: data.settings?.preferredPace || 'moderate',
        accommodations: [],
      },
      progress: {
        completedItems: 0,
        totalItems: 0,
        percentComplete: 0,
        currentPhase: 1,
        lastActivityAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return roadmap;
  }

  async getRoadmapById(id: string, userId: string): Promise<Roadmap | null> {
    return {
      id,
      userId,
      targetJobId: 'target_1',
      title: 'Software Developer Path',
      description: 'Your personalized learning path to become a software developer',
      currentSkills: ['Basic HTML', 'CSS'],
      gapSkills: [],
      phases: [
        {
          id: 'phase_1',
          name: 'Foundation',
          description: 'Build your foundational skills',
          order: 1,
          milestones: [
            {
              id: 'milestone_1',
              title: 'Learn JavaScript Basics',
              description: 'Understand variables, functions, and control flow',
              type: 'skill',
              items: [
                {
                  id: 'item_1',
                  title: 'Variables and Data Types',
                  description: 'Learn about let, const, and data types',
                  type: 'lesson',
                  duration: 30,
                  resources: [],
                  completedAt: null,
                },
              ],
              completedAt: null,
            },
          ],
          estimatedDuration: 40,
        },
      ],
      settings: {
        weeklyHours: 10,
        preferredPace: 'moderate',
        accommodations: [],
      },
      progress: {
        completedItems: 0,
        totalItems: 1,
        percentComplete: 0,
        currentPhase: 1,
        lastActivityAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateRoadmap(id: string, userId: string, updates: any): Promise<Roadmap> {
    return {
      id,
      userId,
      targetJobId: 'target_1',
      title: updates.title || 'Updated Roadmap',
      description: updates.description || '',
      currentSkills: [],
      gapSkills: [],
      phases: [],
      settings: {
        weeklyHours: 10,
        preferredPace: 'moderate',
        accommodations: [],
      },
      progress: {
        completedItems: 0,
        totalItems: 0,
        percentComplete: 0,
        currentPhase: 1,
        lastActivityAt: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async deleteRoadmap(id: string, userId: string): Promise<void> {
    console.log(`Deleting roadmap ${id} for user ${userId}`);
  }

  async updateProgress(id: string, userId: string, updates: any): Promise<Roadmap> {
    const roadmap = await this.getRoadmapById(id, userId);
    if (!roadmap) throw new Error('Roadmap not found');
    
    return {
      ...roadmap,
      progress: {
        ...roadmap.progress,
        ...updates,
        percentComplete: updates.completedItems 
          ? Math.round((updates.completedItems / roadmap.progress.totalItems) * 100)
          : roadmap.progress.percentComplete,
      },
      updatedAt: new Date(),
    };
  }

  async completeItem(roadmapId: string, itemId: string, userId: string): Promise<Roadmap> {
    const roadmap = await this.getRoadmapById(roadmapId, userId);
    if (!roadmap) throw new Error('Roadmap not found');

    const completedItems = roadmap.progress.completedItems + 1;
    const percentComplete = Math.round((completedItems / roadmap.progress.totalItems) * 100);

    return {
      ...roadmap,
      progress: {
        ...roadmap.progress,
        completedItems,
        percentComplete,
        lastActivityAt: new Date(),
      },
      updatedAt: new Date(),
    };
  }
}
