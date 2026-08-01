import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, Button } from '../../../components/ui';
import {
  ArrowLeft,
  Mic,
  Square,
  Pause,
  ChevronRight,
  CheckCircle2,
  Lightbulb,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { interviewService } from '../../../services/interview.service';
import type { InterviewQuestion, InterviewFeedback } from '../../../lib/shared';

type ApiQuestion = InterviewQuestion & { hint?: string };

const FALLBACK_QUESTIONS: ApiQuestion[] = [
  {
    id: '1',
    text: "Tell me about a time when you had to overcome a challenge at work.",
    type: 'behavioral',
    difficulty: 'medium',
    followUpQuestions: [],
    expectedPoints: [],
    scoringCriteria: [],
    hint: 'Use the STAR method (Situation, Task, Action, Result)',
  },
  {
    id: '2',
    text: 'What would you do if you were given a tight deadline that seemed impossible?',
    type: 'situational',
    difficulty: 'medium',
    followUpQuestions: [],
    expectedPoints: [],
    scoringCriteria: [],
    hint: 'Show your problem-solving and prioritization skills',
  },
];

const fallbackFeedback = {
  overallScore: 8,
  strengths: ['Clear communication', 'Specific examples', 'Good structure'],
  improvements: ['Add more quantifiable results', 'Speak a bit slower'],
} as unknown as InterviewFeedback;

const mockQuestions = FALLBACK_QUESTIONS;
const mockFeedback = fallbackFeedback;

export default function InterviewSessionPage() {
  const { id } = useParams();
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [isRecording, setIsRecording] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [response, setResponse] = React.useState('');
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [timeRemaining, setTimeRemaining] = React.useState(120);

  React.useEffect(() => {
    const timer = setInterval(() => {
      if (isRecording && timeRemaining > 0) {
        setTimeRemaining((prev) => prev - 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setTimeRemaining(120);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setShowFeedback(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/interviews">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Practice Interview</h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {mockQuestions.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setIsPaused(!isPaused)}>
            <Pause className="h-4 w-4 mr-1" />
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / mockQuestions.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{currentQuestion + 1} completed</span>
            <span>{mockQuestions.length - currentQuestion - 1} remaining</span>
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-100">
            <CardContent>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 font-bold">{currentQuestion + 1}</span>
                </div>
                <div>
                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                    {mockQuestions[currentQuestion].type}
                  </span>
                  <h2 className="text-xl font-semibold text-gray-900 mt-2">
                    {mockQuestions[currentQuestion].text}
                  </h2>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-white rounded-lg">
                <Lightbulb className="h-5 w-5 text-warning-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">{mockQuestions[currentQuestion].hint}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Recording Area */}
      <Card>
        <CardContent>
          {showFeedback ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2 p-4 bg-success-50 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-success-600" />
                <div>
                  <p className="font-medium text-success-900">Response recorded!</p>
                  <p className="text-sm text-success-700">Here's your feedback</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Strengths</h3>
                <ul className="space-y-2">
                  {mockFeedback.strengths.map((strength, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success-500" />
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Areas to Improve</h3>
                <ul className="space-y-2">
                  {mockFeedback.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-warning-500" />
                      <span className="text-gray-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowFeedback(false)}
                >
                  Re-record
                </Button>
                {currentQuestion < mockQuestions.length - 1 ? (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setShowFeedback(false);
                      setCurrentQuestion((prev) => prev + 1);
                      setResponse('');
                    }}
                  >
                    Next Question
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button className="flex-1">
                    View Full Report
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Timer */}
              <div className="text-center">
                <div className={`text-4xl font-bold ${timeRemaining <= 30 ? 'text-red-500' : 'text-gray-900'}`}>
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-sm text-gray-500">Time remaining</p>
              </div>

              {/* Response Area */}
              <div>
                <label className="label mb-2">Your Response</label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response here, or use the microphone to record..."
                  className="input min-h-[150px] resize-none"
                  disabled={isRecording}
                />
              </div>

              {/* Recording Controls */}
              <div className="flex items-center justify-center gap-4">
                {!isRecording ? (
                  <Button
                    size="lg"
                    className="rounded-full w-16 h-16"
                    onClick={handleStartRecording}
                  >
                    <Mic className="h-6 w-6" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="danger"
                    className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
                    onClick={handleStopRecording}
                  >
                    <Square className="h-6 w-6" />
                  </Button>
                )}
              </div>
              <p className="text-center text-sm text-gray-500">
                {isRecording ? 'Click to stop recording' : 'Click to start recording'}
              </p>

              {/* Submit Button */}
              {response.length > 20 && !isRecording && (
                <Button
                  className="w-full"
                  onClick={() => setShowFeedback(true)}
                >
                  Submit Response
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lightbulb className="h-5 w-5 text-secondary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Interview Tips</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Take a moment to gather your thoughts before answering</li>
                <li>• Use specific examples from your experience</li>
                <li>• Speak clearly and at a comfortable pace</li>
                <li>• Don't worry about small stumbles - it's natural!</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}