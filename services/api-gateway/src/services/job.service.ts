import type { Job, JobSearchParams, JDAnalysis } from '@ai4a/shared';

export class JobService {
  async searchJobs(params: JobSearchParams): Promise<{ jobs: Job[]; total: number; page: number; totalPages: number }> {
    const mockJobs: Job[] = [
      {
        id: 'job_1',
        source: 'linkedin',
        url: 'https://linkedin.com/jobs/view/1',
        basic: {
          title: 'Software Developer',
          company: 'Tech Corp',
          location: 'Remote',
          remote: 'remote',
          salary: { min: 80000, max: 120000, currency: 'USD' },
        },
        details: {
          description: 'We are looking for a talented software developer...',
          responsibilities: ['Write clean code', 'Collaborate with team', 'Review code'],
          requirements: {
            education: ['Bachelor in CS'],
            experience: '2+ years',
            skills: ['JavaScript', 'React', 'Node.js'],
          },
          benefits: ['Health insurance', 'Remote work', 'Flexible hours'],
        },
        accessibility: {
          rating: 85,
          features: ['Remote work available', 'Flexible schedule'],
          accommodations: ['Screen reader compatible', 'Extended time for tests'],
          barriers: ['Some in-person meetings may be required'],
          communityRating: 4.2,
        },
        analysis: null,
        postedAt: new Date(),
        scrapedAt: new Date(),
      },
    ];

    return {
      jobs: mockJobs,
      total: mockJobs.length,
      page: params.page || 1,
      totalPages: 1,
    };
  }

  async getJobById(id: string): Promise<Job | null> {
    return {
      id,
      source: 'linkedin',
      url: 'https://linkedin.com/jobs/view/1',
      basic: {
        title: 'Software Developer',
        company: 'Tech Corp',
        location: 'Remote',
        remote: 'remote',
        salary: { min: 80000, max: 120000, currency: 'USD' },
      },
      details: {
        description: 'We are looking for a talented software developer...',
        responsibilities: ['Write clean code', 'Collaborate with team', 'Review code'],
        requirements: {
          education: ['Bachelor in CS'],
          experience: '2+ years',
          skills: ['JavaScript', 'React', 'Node.js'],
        },
        benefits: ['Health insurance', 'Remote work', 'Flexible hours'],
      },
      accessibility: {
        rating: 85,
        features: ['Remote work available', 'Flexible schedule'],
        accommodations: ['Screen reader compatible', 'Extended time for tests'],
        barriers: ['Some in-person meetings may be required'],
        communityRating: 4.2,
      },
      analysis: null,
      postedAt: new Date(),
      scrapedAt: new Date(),
    };
  }

  async analyzeJob(jobId: string, userId: string, userProfile?: any): Promise<JDAnalysis> {
    return {
      summary: {
        plainLanguage: 'This job involves writing computer programs...',
        readingLevel: 8,
        confidence: 0.92,
      },
      keyResponsibilities: [
        {
          original: 'Write clean, maintainable code',
          simplified: 'Write computer code that is easy to understand and change',
          difficulty: 'medium',
          accommodationPossible: true,
        },
      ],
      skills: [
        { name: 'JavaScript', importance: 'required', transferable: true },
        { name: 'React', importance: 'preferred', transferable: true },
      ],
      accessibility: {
        remotePotential: 90,
        physicalDemands: 'minimal',
        accommodationScore: 85,
        barriers: ['May require occasional travel'],
        suggestions: ['Request fully remote position'],
      },
      compensation: {
        range: { min: 80000, max: 120000 },
        currency: 'USD',
        benchmark: 75,
      },
    };
  }

  async getSavedJobs(userId: string): Promise<Job[]> {
    return [];
  }

  async saveJob(jobId: string, userId: string): Promise<void> {
    console.log(`Saving job ${jobId} for user ${userId}`);
  }

  async unsaveJob(jobId: string, userId: string): Promise<void> {
    console.log(`Unsaving job ${jobId} for user ${userId}`);
  }
}
