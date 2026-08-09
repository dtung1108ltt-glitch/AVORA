import { Link } from 'react-router-dom';
import { Card, CardContent, Button } from '../../../components/ui';
import { Mic, Clock, Star, ArrowRight, History, Plus } from 'lucide-react';

const interviews = [
  {
    id: '1',
    title: 'Software Developer Interview',
    jobType: 'Software Developer',
    date: '2 hours ago',
    score: 85,
    status: 'completed',
    questionsAnswered: 5,
    totalQuestions: 5,
    feedback: 'Great job! You showed strong technical knowledge and clear communication.',
  },
  {
    id: '2',
    title: 'UX Designer Practice',
    jobType: 'UX Designer',
    date: '1 day ago',
    score: 72,
    status: 'completed',
    questionsAnswered: 4,
    totalQuestions: 5,
    feedback: 'Good structure in your answers. Consider using more specific examples.',
  },
  {
    id: '3',
    title: 'Data Analyst Interview',
    jobType: 'Data Analyst',
    date: '3 days ago',
    status: 'paused',
    questionsAnswered: 2,
    totalQuestions: 5,
  },
];

export default function InterviewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-2 mb-2">Practice Interviews</h1>
          <p className="text-gray-600">
            Prepare for your interviews with AI-powered practice and feedback.
          </p>
        </div>
        <Link to="/interviews/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            New Interview
          </Button>
        </Link>
      </div>

      {/* Quick Start */}
      <Card className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Ready to Practice?</h3>
              <p className="text-white/90 mb-4">
                Start a mock interview tailored to your target job and get personalized feedback.
              </p>
            </div>
            <Button className="bg-white text-primary-600 hover:bg-gray-100" size="lg">
              <Mic className="h-5 w-5 mr-2" />
              Start Interview
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interview Tips */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: Star, title: 'Be Specific', desc: 'Use concrete examples from your experience' },
          { icon: Clock, title: 'Take Your Time', desc: "Don't rush - it's okay to pause and think" },
          { icon: History, title: 'Practice Regularly', desc: 'The more you practice, the more confident you become' },
        ].map((tip, index) => {
          const Icon = tip.icon;
          return (
            <Card key={index}>
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{tip.title}</h4>
                    <p className="text-sm text-gray-600">{tip.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Interview Types */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Interview Types</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { type: 'behavioral', title: 'Behavioral', desc: 'Past experiences and actions', count: 12 },
            { type: 'technical', title: 'Technical', desc: 'Job-specific skills', count: 8 },
            { type: 'situational', title: 'Situational', desc: 'Hypothetical scenarios', count: 6 },
            { type: 'disability', title: 'Disability', desc: 'Rights and disclosure', count: 4 },
          ].map((item) => (
            <Card key={item.type} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent>
                <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{item.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{item.count} questions</span>
                  <ArrowRight className="h-4 w-4 text-primary-600" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Interviews */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Interviews</h2>
        <div className="space-y-4">
          {interviews.map((interview) => (
            <Card key={interview.id} className="hover:shadow-md transition-shadow">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      interview.status === 'completed' ? 'bg-success-100' : 'bg-warning-100'
                    }`}>
                      {interview.status === 'completed' ? (
                        <Star className="h-6 w-6 text-success-600" />
                      ) : (
                        <Clock className="h-6 w-6 text-warning-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{interview.title}</h4>
                      <p className="text-sm text-gray-600">
                        {interview.jobType} • {interview.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {interview.status === 'completed' && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{interview.score}</p>
                        <p className="text-xs text-gray-500">Score</p>
                      </div>
                    )}
                    <Link to={`/interviews/${interview.id}`}>
                      <Button variant="outline" size="sm">
                        {interview.status === 'completed' ? 'Review' : 'Continue'}
                      </Button>
                    </Link>
                  </div>
                </div>
                {interview.status === 'completed' && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Feedback: </span>
                      {interview.feedback}
                    </p>
                  </div>
                )}
                {interview.status === 'paused' && (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{
                          width: `${(interview.questionsAnswered / interview.totalQuestions) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-500">
                      {interview.questionsAnswered}/{interview.totalQuestions}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}