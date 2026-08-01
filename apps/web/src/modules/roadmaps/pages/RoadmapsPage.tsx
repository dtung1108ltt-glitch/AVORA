import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Button } from '../../../components/ui';
import { Plus, Target, Clock, CheckCircle2, PlayCircle, Trash2, Edit2 } from 'lucide-react';
import { formatDuration } from '../../../utils/helpers';
import { post } from '../../../services/api';

const roadmaps = [
  {
    id: '1',
    title: 'Software Developer Path',
    targetJob: 'Software Developer',
    progress: 45,
    currentPhase: 2,
    totalPhases: 4,
    totalHours: 120,
    completedHours: 54,
    lastActivity: '2 hours ago',
  },
  {
    id: '2',
    title: 'UX Designer Journey',
    targetJob: 'UX Designer',
    progress: 20,
    currentPhase: 1,
    totalPhases: 3,
    totalHours: 80,
    completedHours: 16,
    lastActivity: '1 day ago',
  },
];

export default function RoadmapsPage() {
  const [jd, setJd] = React.useState('');
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<any>(null);

  const handleAnalyze = async () => {
    if (!jd.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await post('/api/ai/analyze-jd', {
        jobDescription: jd,
      });
      setAnalysis(res?.analysis ?? null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-2 mb-2">Your Career Roadmaps</h1>
          <p className="text-gray-600">
            Personalized learning paths to help you reach your career goals.
          </p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />}>
          Create New Roadmap
        </Button>
      </div>

      {/* Active Roadmaps */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Roadmaps</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {roadmaps.map((roadmap) => (
            <Card key={roadmap.id} className="hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-5 w-5 text-primary-600" />
                      <span className="text-sm text-gray-500">Career Path</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{roadmap.title}</h3>
                    <p className="text-sm text-gray-600">Target: {roadmap.targetJob}</p>
                  </div>
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm font-medium">
                    {roadmap.progress}% Complete
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all"
                      style={{ width: `${roadmap.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Phase {roadmap.currentPhase} of {roadmap.totalPhases}</span>
                    <span>{formatDuration(roadmap.completedHours)} / {formatDuration(roadmap.totalHours)}</span>
                  </div>
                </div>

                {/* Phases */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: roadmap.totalPhases }).map((_, index) => (
                    <div
                      key={index}
                      className={`flex-1 h-1.5 rounded-full ${
                        index < roadmap.currentPhase
                          ? 'bg-primary-500'
                          : index === roadmap.currentPhase
                          ? 'bg-primary-300'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Last activity: {roadmap.lastActivity}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link to={`/roadmaps/${roadmap.id}`} className="flex-1">
                    <Button className="w-full" leftIcon={<PlayCircle className="h-4 w-4" />}>
                      Continue
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Create New Card */}
          <Card className="border-dashed border-2 border-gray-300 hover:border-primary-400 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Roadmap</h3>
              <p className="text-gray-500 text-sm mb-4">
                Start a personalized learning path for your dream job
              </p>
              <Button variant="outline">Choose a Career</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Completed Roadmaps */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Completed</h2>
        <Card>
          <CardContent>
            <div className="flex items-center justify-center py-8 text-center">
              <div>
                <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No completed roadmaps yet</p>
                <p className="text-sm text-gray-400">Keep going to complete your first roadmap!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
