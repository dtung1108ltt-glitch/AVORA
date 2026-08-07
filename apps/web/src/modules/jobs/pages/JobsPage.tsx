import React from 'react';
import { Card, CardContent, Button } from '../../../components/ui';
import { Search, Filter, MapPin, Building2, DollarSign, ArrowRight, Bookmark, Share2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/helpers';

const jobs = [
  {
    id: 1,
    title: 'Software Developer',
    company: 'TechCorp',
    location: 'Remote',
    salary: { min: 80000, max: 120000 },
    type: 'Full-time',
    tags: ['Remote', 'Accessibility Friendly', 'Flexible Hours'],
    matchScore: 92,
    postedDays: 2,
  },
  {
    id: 2,
    title: 'UX Designer',
    company: 'DesignStudio',
    location: 'San Francisco, CA',
    salary: { min: 90000, max: 130000 },
    type: 'Full-time',
    tags: ['Hybrid', 'Inclusive Team', 'Health Benefits'],
    matchScore: 85,
    postedDays: 5,
  },
  {
    id: 3,
    title: 'Data Analyst',
    company: 'DataViz Inc',
    location: 'Remote',
    salary: { min: 70000, max: 95000 },
    type: 'Full-time',
    tags: ['Remote', 'Growth Opportunities'],
    matchScore: 78,
    postedDays: 1,
  },
];

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [savedJobs, setSavedJobs] = React.useState<number[]>([]);

  const toggleSave = (id: number) => {
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-2 mb-2">Find Your Perfect Job</h1>
        <p className="text-gray-600">
          Discover accessible job opportunities that match your skills and preferences.
        </p>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs, companies, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-12"
              />
            </div>
            <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>
              Filters
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {['Remote Only', 'Accessibility Friendly', 'Entry Level', 'Flexible Hours'].map((filter) => (
              <button
                key={filter}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                {filter}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          <span className="font-semibold text-gray-900">{jobs.length}</span> jobs found
        </p>
        <select className="input w-auto">
          <option>Most Relevant</option>
          <option>Most Recent</option>
          <option>Highest Salary</option>
        </select>
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardContent>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-success-100 text-success-700 rounded text-xs font-medium">
                      {job.matchScore}% Match
                    </span>
                    <span className="text-sm text-gray-500">{job.postedDays}d ago</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatCurrency(job.salary.min)} - {formatCurrency(job.salary.max)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSave(job.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      savedJobs.includes(job.id)
                        ? 'bg-primary-100 text-primary-600'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    aria-label={savedJobs.includes(job.id) ? 'Unsave job' : 'Save job'}
                  >
                    <Bookmark className={`h-5 w-5 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {job.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <a href={`/jobs/${job.id}`} className="flex-1">
                  <Button className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    View Details
                  </Button>
                </a>
                <Button variant="outline">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg">
          Load More Jobs
        </Button>
      </div>
    </div>
  );
}
