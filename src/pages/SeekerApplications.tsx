import React, { useState } from 'react';
import { useAppData } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../lib/Card';
import { Badge } from '../lib/Badge';
import { ShieldCheck, MapPin, Building2, Banknote, CalendarCheck, CheckCircle2, Star } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { Button } from '../lib/Button';
import { Application, EmployerProfile } from '../types';
import { MOCK_USERS } from '../data/mock';

export function SeekerApplications() {
  const { applications, jobs, escrows, employerReviews, addEmployerReview } = useAppData();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [reviewingAppId, setReviewingAppId] = useState<string | null>(null);

  if (!profile) return null;

  const myApplications = applications.filter(a => a.seekerId === profile.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted':
      case 'Hired':
      case 'Completed': return 'success';
      case 'Rejected': return 'danger';
      case 'Shortlisted': return 'warning';
      case 'Under Review': return 'secondary';
      default: return 'outline';
    }
  }

  const usersStr = localStorage.getItem('worksphere_users');
  const allUsers: (any)[] = usersStr ? JSON.parse(usersStr) : MOCK_USERS;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Applications</h1>
        <p className="text-slate-400">Track your job applications and payment statuses.</p>
      </div>

      <div className="space-y-4">
        {myApplications.length > 0 ? (
          myApplications.map(app => {
            const job = jobs.find(j => j.id === app.jobId);
            if (!job) return null;
            
            const relatedEscrow = escrows.find(e => e.applicationId === app.id);
            const reviewed = employerReviews.some(r => r.applicationId === app.id);
            const employer = allUsers.find(u => u.id === job.employerId) as EmployerProfile;

            return (
              <Card key={app.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start justify-between">
                         <div>
                            <h3 className="text-lg font-semibold text-slate-100">{job.title}</h3>
                            <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              {employer?.companyName || 'TechCorp Solutions'}
                            </p>
                         </div>
                         <Badge variant={getStatusColor(app.status)}>{app.status === 'Hired' || app.status === 'Accepted' ? 'Accepted' : app.status}</Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> {job.location}</span>
                        <span className="flex items-center gap-1.5"><Banknote className="w-3.5 h-3.5"/> {formatCurrency(job.salaryMin)} - {formatCurrency(job.salaryMax)}/{job.salaryType}</span>
                        <span className="flex items-center gap-1.5"><CalendarCheck className="w-3.5 h-3.5"/> Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="min-w-[200px] md:pl-4 md:border-l border-slate-800 flex flex-col justify-center">
                       {(app.status === 'Hired' || app.status === 'Accepted') ? (
                          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Payment Protection</h4>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${relatedEscrow ? 'bg-amber-400' : 'bg-slate-500'}`}></div>
                              <span className="text-sm font-medium">
                                {relatedEscrow ? `Escrow: ${relatedEscrow.status}` : 'Pending Escrow'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Funds are secure.</p>
                          </div>
                       ) : app.status === 'Completed' ? (
                          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                            <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                            <h4 className="text-sm font-semibold text-emerald-400 capitalize mb-1">Job Completed</h4>
                            <p className="text-xs text-slate-400">Payment released.</p>
                          </div>
                       ) : (
                          <div className="text-center p-4 bg-slate-900/50 rounded-lg">
                            <p className="text-sm font-bold text-slate-300">Match Profile</p>
                            <p className="text-2xl font-bold text-indigo-400 mt-1">{app.matchScore}%</p>
                          </div>
                       )}
                    </div>
                  </div>

                  {/* FEATURE 5: APPLICATION PROGRESS TRACKING TIMELINE */}
                  <ApplicationTimeline status={app.status} />

                  {app.status === 'Completed' && !reviewed && employer && (
                    <div className="mt-6 pt-6 border-t border-slate-800">
                      {reviewingAppId === app.id ? (
                        <WorkerReviewForm 
                          app={app} 
                          employer={employer} 
                          seekerId={profile.id} 
                          onSubmit={(r) => {
                            addEmployerReview(r);
                            setReviewingAppId(null);
                          }} 
                          onCancel={() => setReviewingAppId(null)}
                        />
                      ) : (
                        <div className="flex justify-end">
                          <Button 
                            className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2 font-semibold text-sm transition-all shadow-md px-5 py-2.5 rounded-lg"
                            onClick={() => setReviewingAppId(app.id)}
                          >
                            <Star className="w-4 h-4 fill-white text-white" />
                            Rate Employer
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  {app.status === 'Completed' && reviewed && (
                    <div className="mt-6 pt-4 border-t border-slate-800 text-sm text-slate-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      You have evaluated this employer.
                    </div>
                  )}

                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-12 text-slate-500 space-y-4">
            <p>You haven't applied to any jobs yet.</p>
            <Button onClick={() => navigate('/seeker/jobs')}>Explore Jobs</Button>
          </div>
        )}
      </div>
    </div>
  )
}

function WorkerReviewForm({ 
  app, 
  employer, 
  seekerId, 
  onSubmit,
  onCancel 
}: { 
  app: Application, 
  employer: EmployerProfile, 
  seekerId: string, 
  onSubmit: (r: any) => void,
  onCancel: () => void 
}) {
  const [overallRating, setOverallRating] = useState(0);
  const [workEnvironment, setWorkEnvironment] = useState(0);
  const [paymentFairness, setPaymentFairness] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [professionalism, setProfessionalism] = useState(0);
  const [jobAccuracy, setJobAccuracy] = useState(0);
  const [comment, setComment] = useState('');

  const submit = () => {
    onSubmit({
      applicationId: app.id,
      employerId: employer.id,
      seekerId,
      rating: overallRating,
      comment,
      categories: {
        safety: workEnvironment, // mapping
        payment: paymentFairness, // mapping
        communication,
        professionalism,
        workEnvironment,
        paymentFairness,
        jobAccuracy
      }
    });
  };

  const isReady = overallRating > 0 && 
                  workEnvironment > 0 && 
                  paymentFairness > 0 && 
                  communication > 0 && 
                  professionalism > 0 && 
                  jobAccuracy > 0;

  const categoriesConfig = [
    { label: 'Work Environment', value: workEnvironment, setValue: setWorkEnvironment },
    { label: 'Payment Fairness', value: paymentFairness, setValue: setPaymentFairness },
    { label: 'Communication', value: communication, setValue: setCommunication },
    { label: 'Professionalism', value: professionalism, setValue: setProfessionalism },
    { label: 'Job Accuracy', value: jobAccuracy, setValue: setJobAccuracy }
  ];

  return (
    <div className="space-y-6 bg-slate-950 border border-slate-800 p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-base font-bold text-slate-100">Rate your experience with {employer.companyName}</h4>
          <p className="text-xs text-slate-400 mt-0.5">Help fellow job seekers by sharing your verified working experience.</p>
        </div>
        <button onClick={onCancel} className="text-xs text-slate-500 hover:text-slate-305 transition-colors">
          Cancel
        </button>
      </div>

      {/* Overall Rating Selection */}
      <div className="bg-slate-900 border border-indigo-500/10 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-sm font-semibold text-slate-200">Overall Rating</span>
          <p className="text-xs text-slate-400 mt-0.5">How would you summarize your overall experience?</p>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button 
              key={star} 
              type="button"
              onClick={() => setOverallRating(star)} 
              className="hover:scale-110 active:scale-95 transition-transform p-0.5"
            >
              <Star className={`w-7 h-7 ${star <= overallRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Category Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categoriesConfig.map(cat => (
          <div key={cat.label} className="flex justify-between items-center bg-slate-900 border border-slate-800/60 p-4 rounded-xl">
            <span className="text-sm font-medium text-slate-300">{cat.label}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star} 
                  type="button" 
                  onClick={() => cat.setValue(star)} 
                  className="hover:scale-115 active:scale-90 transition-all p-0.5"
                >
                  <Star className={`w-5 h-5 ${star <= cat.value ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Comment Section */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-300">Written Feedback (Optional)</label>
        <textarea 
          placeholder="Leave an optional comment about the work environment, payment history, or overall experience..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-amber-500 resize-none min-h-[100px] transition-all"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
      </div>

      <div className="flex gap-3 justify-end items-center">
        <button 
          onClick={onCancel} 
          className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          Cancel
        </button>
        <Button 
          disabled={!isReady} 
          onClick={submit} 
          className="bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow px-6 py-2 rounded-lg"
        >
          Submit Review
        </Button>
      </div>
    </div>
  );
}

// Visual Application Progress Tracking Timeline Component
function ApplicationTimeline({ status }: { status: Application['status'] }) {
  // Define progressive stages
  const stages = [
    { label: 'Applied', key: 'Applied' },
    { label: 'Under Review', key: 'Under Review' },
    { label: 'Shortlisted', key: 'Shortlisted' },
    { label: 'Interview Scheduled', key: 'Interview Scheduled' },
    { label: 'Interview Completed', key: 'Interview Completed' },
    { label: status === 'Rejected' ? 'Rejected' : 'Selected', key: 'Selected' }
  ];

  // Match the active step level
  let activeIndex = 0;
  if (status === 'Applied') {
    activeIndex = 0;
  } else if (status === 'Under Review') {
    activeIndex = 1;
  } else if (status === 'Shortlisted') {
    activeIndex = 2;
  } else if (status === 'Hired' || status === 'Accepted') {
    activeIndex = 5; // Passes scheduled, completed & reaches selected
  } else if (status === 'Completed') {
    activeIndex = 5;
  } else if (status === 'Rejected') {
    activeIndex = 5; // Terminal step
  }

  return (
    <div className="mt-6 pt-5 border-t border-slate-800/60">
      <p className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">Application Status Tracking</p>
      
      {/* Horizontal workflow bar */}
      <div className="relative flex items-center justify-between w-full">
        {/* Inactive connection lane */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 pointer-events-none z-0"></div>
        
        {/* Active glowing connection lane */}
        <div 
          className={`absolute left-0 top-1/2 -translate-y-1/2 h-0.5 pointer-events-none z-0 transition-all duration-500 ease-in-out ${status === 'Rejected' ? 'bg-rose-500' : 'bg-indigo-500'}`}
          style={{ width: `${(activeIndex / (stages.length - 1)) * 100}%` }}
        ></div>

        {stages.map((stage, i) => {
          const isCompleted = i <= activeIndex;
          const isCurrent = i === activeIndex;
          const isLast = i === stages.length - 1;
          const isRejected = isLast && status === 'Rejected';

          let circleClass = 'bg-slate-900 border-slate-800 text-slate-500';
          if (isCompleted) {
            circleClass = isRejected 
              ? 'bg-rose-950/80 border-rose-500 text-rose-400 shrink-0 shadow-lg ring-2 ring-rose-500/10' 
              : isCurrent 
                ? 'bg-indigo-600 border-indigo-400 text-white shrink-0 shadow-lg ring-2 ring-indigo-500/20 scale-105' 
                : 'bg-indigo-550 border-indigo-500 text-indigo-400 shrink-0';
          }

          return (
            <div key={stage.label} className="flex flex-col items-center relative z-10 flex-1">
              {/* Circle progress nodes */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${circleClass}`}>
                {isCompleted && !isCurrent ? (
                  isRejected ? '✗' : '✓'
                ) : (
                  i + 1
                )}
              </div>
              {/* Responsive status descriptions descriptors */}
              <span className={`text-[9px] md:text-xs font-medium mt-2 text-center transition-colors duration-200 ${isCurrent ? (isRejected ? 'text-rose-400 font-semibold' : 'text-indigo-400 font-semibold') : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
