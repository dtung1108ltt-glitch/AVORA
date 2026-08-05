import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../../../components/ui';
import { ArrowLeft, CheckCircle2, Circle, PlayCircle, Clock, Target, BookOpen } from 'lucide-react';
import { formatDuration } from '../../../utils/helpers';
import { Link } from 'react-router-dom';

const mockRoadmap = {
  id: '1',
  title: 'Software Developer Path',
  targetJob: 'Software Developer',
  progress: 45,
  currentPhase: 2,
  phases: [
    {
      id: 'p1',
      name: 'Foundation',
      description: 'Build your programming fundamentals',
      status: 'completed',
      milestones: [
        {
          id: 'm1',
          name: 'HTML & CSS Basics',
          description: 'Learn the building blocks of web pages',
          status: 'completed',
          items: [
            { id: 'i1', name: 'Introduction to HTML', type: 'lesson', duration: 30, completed: true },
            { id: 'i2', name: 'HTML Elements & Tags', type: 'lesson', duration: 45, completed: true },
            { id: 'i3', name: 'CSS Styling Basics', type: 'lesson', duration: 45, completed: true },
            { id: 'i4', name: 'Build a Simple Page', type: 'project', duration: 60, completed: true },
          ],
        },
        {
          id: 'm2',
          name: 'JavaScript Fundamentals',
          description: 'Learn programming with JavaScript',
          status: 'completed',
          items: [
            { id: 'i5', name: 'Variables & Data Types', type: 'lesson', duration: 30, completed: true },
            { id: 'i6', name: 'Functions & Control Flow', type: 'lesson', duration: 45, completed: true },
            { id: 'i7', name: 'Arrays & Objects', type: 'lesson', duration: 45, completed: true },
            { id: 'i8', name: 'JavaScript Quiz', type: 'quiz', duration: 20, completed: true },
          ],
        },
      ],
    },
    {
      id: 'p2',
      name: 'Frontend Development',
      description: 'Learn modern frontend frameworks',
      status: 'in-progress',
      milestones: [
        {
          id: 'm3',
          name: 'React Basics',
          description: 'Learn the most popular UI library',
          status: 'in-progress',
          items: [
            { id: 'i9', name: 'Introduction to React', type: 'lesson', duration: 30, completed: true },
            { id: 'i10', name: 'Components & Props', type: 'lesson', duration: 45, completed: false },
            { id: 'i11', name: 'State & Lifecycle', type: 'lesson', duration: 45, completed: false },
            { id: 'i12', name: 'Build a Todo App', type: 'project', duration: 90, completed: false },
          ],
        },
        {
          id: 'm4',
          name: 'State Management',
          description: 'Manage application state effectively',
          status: 'pending',
          items: [
            { id: 'i13', name: 'Introduction to State', type: 'lesson', duration: 30, completed: false },
            { id: 'i14', name: 'Context API', type: 'lesson', duration: 45, completed: false },
            { id: 'i15', name: 'Zustand Basics', type: 'lesson', duration: 45, completed: false },
          ],
        },
      ],
    },
    {
      id: 'p3',
      name: 'Backend Development',
      description: 'Learn server-side programming',
      status: 'pending',
      milestones: [],
    },
    {
      id: 'p4',
      name: 'Career Preparation',
      description: 'Prepare for job applications',
      status: 'pending',
      milestones: [],
    },
  ],
};

export default function RoadmapDetailPage() {
  const { id } = useParams();
  const [expandedPhase, setExpandedPhase] = React.useState<string | null>('p2');

  const togglePhase = (phaseId: string) => {
    setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-success-500" />;
      case 'in-progress':
        return <div className="w-5 h-5 border-2 border-primary-500 rounded-full animate-pulse" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  const totalItems = mockRoadmap.phases.reduce(
    (acc, phase) => acc + phase.milestones.reduce((mAcc, m) => mAcc + m.items.length, 0),
    0
  );
  const completedItems = mockRoadmap.phases.reduce(
    (acc, phase) =>
      acc +
      phase.milestones.reduce(
        (mAcc, m) => mAcc + m.items.filter((i) => i.completed).length,
        0
      ),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/roadmaps">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="heading-2">{mockRoadmap.title}</h1>
          <p className="text-gray-600">Target: {mockRoadmap.targetJob}</p>
        </div>
        <Button>Edit Roadmap</Button>
      </div>

      {/* Progress Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">{mockRoadmap.progress}%</p>
              <p className="text-sm text-gray-500">Complete</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{completedItems}/{totalItems}</p>
              <p className="text-sm text-gray-500">Items Done</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{mockRoadmap.currentPhase}</p>
              <p className="text-sm text-gray-500">Current Phase</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{mockRoadmap.phases.length}</p>
              <p className="text-sm text-gray-500">Total Phases</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {mockRoadmap.phases.map((phase, index) => (
          <Card
            key={phase.id}
            className={`transition-all ${
              phase.status === 'in-progress' ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            <div
              className="p-4 cursor-pointer"
              onClick={() => togglePhase(phase.id)}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">{getStatusIcon(phase.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-500">Phase {index + 1}</span>
                    {phase.status === 'completed' && (
                      <span className="px-2 py-0.5 bg-success-100 text-success-700 rounded text-xs">
                        Completed
                      </span>
                    )}
                    {phase.status === 'in-progress' && (
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                        In Progress
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{phase.name}</h3>
                  <p className="text-sm text-gray-600">{phase.description}</p>
                </div>
              </div>
            </div>

            {expandedPhase === phase.id && phase.milestones.length > 0 && (
              <div className="border-t border-gray-100 p-4 space-y-4">
                {phase.milestones.map((milestone) => (
                  <div key={milestone.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(milestone.status)}
                      <h4 className="font-medium text-gray-900">{milestone.name}</h4>
                      <span className="text-sm text-gray-500">({milestone.items.length} items)</span>
                    </div>
                    <div className="ml-7 space-y-2">
                      {milestone.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          {item.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-success-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-300" />
                          )}
                          <div className="flex-1">
                            <p className={`font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.type} • {formatDuration(item.duration)}
                            </p>
                          </div>
                          {!item.completed && (
                            <Button size="sm" variant="outline" leftIcon={<PlayCircle className="h-4 w-4" />}>
                              Start
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
