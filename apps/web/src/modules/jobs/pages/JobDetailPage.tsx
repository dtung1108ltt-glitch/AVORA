import React from 'react';

import { Card, CardHeader, CardTitle, CardContent, Button } from '../../../components/ui';
import { MapPin, Building2, DollarSign, CheckCircle2, Bookmark, Share2, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../../utils/helpers';

const mockJob = {
  id: '1',
  title: 'Software Developer',
  company: 'TechCorp',
  location: 'Remote',
  salary: { min: 80000, max: 120000 },
  type: 'Full-time',
  description: 'We are looking for a talented Software Developer to join our inclusive team. You will be responsible for building and maintaining web applications, collaborating with cross-functional teams, and writing clean, maintainable code.',
  responsibilities: [
    'Design and develop new features for our web platform',
    'Collaborate with product managers and designers',
    'Write clean, testable, and maintainable code',
    'Participate in code reviews and mentor junior developers',
    'Troubleshoot and debug issues in production',
  ],
  requirements: {
    education: "Bachelor's degree in Computer Science or equivalent",
    experience: '3+ years of professional software development',
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Git'],
  },
  benefits: [
    'Competitive salary and equity',
    'Full remote work option',
    'Flexible hours',
    'Health, dental, and vision insurance',
    'Professional development budget',
    'Accessible workplace',
  ],
  accessibility: {
    score: 92,
    features: [
      '100% remote work available',
      'Asynchronous communication culture',
      'Screen reader optimized tools',
      'Flexible scheduling for appointments',
    ],
    accommodations: [
      'Extended time for tasks if needed',
      'Assistive technology budget',
      'Flexible break schedule',
      'Noise-reduced workspace (for remote, means flexibility)',
    ],
  },
};

const simplifiedText = {
  summary: "This job is about writing computer programs to build websites and apps. You'll work with a team to create new features and fix problems. Most of the work can be done from home.",
  keyPoints: [
    { original: 'Cross-functional collaboration', simplified: 'Working with different teams' },
    { original: 'Agile methodology', simplified: 'Working in short cycles to complete projects' },
    { original: 'CI/CD pipelines', simplified: 'Automatic testing and deployment of code' },
  ],
};

export default function JobDetailPage() {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'simplified' | 'accessibility'>('overview');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <span className="px-2 py-0.5 bg-success-100 text-success-700 rounded text-xs font-medium">
                92% Match
              </span>
              <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-1">{mockJob.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {mockJob.company}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {mockJob.location}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {formatCurrency(mockJob.salary.min)} - {formatCurrency(mockJob.salary.max)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button>Apply Now</Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {['Remote', 'Full-time', 'Accessibility Friendly'].map((tag) => (
              <span key={tag} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Job Overview' },
          { id: 'simplified', label: 'Easy Language Version' },
          { id: 'accessibility', label: 'Accessibility Info' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-2 font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About This Role</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{mockJob.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {mockJob.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{resp}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Education</h4>
                  <p className="text-gray-600">{mockJob.requirements.education}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
                  <p className="text-gray-600">{mockJob.requirements.experience}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {mockJob.requirements.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {mockJob.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success-500 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-primary-50 border-primary-100">
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary-600" />
                  <h4 className="font-semibold text-primary-900">AI Analysis</h4>
                </div>
                <p className="text-primary-800 text-sm mb-4">
                  This job has a high accessibility score. Remote work is available, and the company has policies supporting employees with disabilities.
                </p>
                <Button size="sm" variant="outline" className="border-primary-300 text-primary-700">
                  Get Full Analysis
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'simplified' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary-600" />
              Easy Language Version
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-success-50 rounded-xl border border-success-100">
              <h3 className="font-semibold text-success-900 mb-2">In Simple Terms:</h3>
              <p className="text-success-800">{simplifiedText.summary}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Key Points Explained:</h3>
              <div className="space-y-3">
                {simplifiedText.keyPoints.map((point, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 text-sm mb-1">Original: {point.original}</p>
                    <p className="text-gray-900 font-medium">= {point.simplified}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-primary-50 rounded-xl">
              <h3 className="font-semibold text-primary-900 mb-2">What You'd Actually Do:</h3>
              <ul className="space-y-2 text-primary-800">
                <li>• Write code to build websites and apps</li>
                <li>• Talk with your team about what to build</li>
                <li>• Test your code to make sure it works</li>
                <li>• Fix problems when they come up</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'accessibility' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="12"
                      strokeDasharray={`${(mockJob.accessibility.score / 100) * 352} 352`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">{mockJob.accessibility.score}</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-gray-600">
                This job has excellent accessibility features and accommodations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {mockJob.accessibility.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Supported Accommodations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {mockJob.accessibility.accommodations.map((acc, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-success-500" />
                      <span className="font-medium text-gray-900">{acc}</span>
                    </div>
                    <p className="text-sm text-gray-500">This accommodation is supported</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
