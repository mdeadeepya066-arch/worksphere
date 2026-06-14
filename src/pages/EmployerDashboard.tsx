import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppData, useUserStats } from '../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../lib/Card';
import { Button } from '../lib/Button';
import { PlusCircle, Users, Briefcase, Star, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmployerProfile, SeekerProfile, Application, EmployerReview, SeekerReview } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Badge } from '../lib/Badge';
import { MOCK_USERS } from '../data/mock';

export function EmployerDashboard() {
  const { profile } = useAuth();
  const { jobs, applications, seekerReviews, employerReviews, addSeekerReview, updateApplicationStatus } = useAppData();
  const navigate = useNavigate();

  const employer = profile as EmployerProfile;
  const myStats = useUserStats(employer);

  if (!employer) return null;

  const myJobs = jobs.filter(j => j.employerId === employer.id);
  const myJobIds = myJobs.map(j => j.id);
  const myApplications = applications.filter(a => myJobIds.includes(a.jobId));
  
  const hiredCount = myApplications.filter(a => a.status === 'Hired' || a.status === 'Accepted' || a.status === 'Completed').length;
  const activeJobsCount = myJobs.filter(j => j.status === 'active').length;

  const completedApplications = myApplications.filter(a => a.status === 'Completed');

  const chartData = [
    { name: 'Total Jobs', value: myJobs.length },
    { name: 'Active', value: activeJobsCount },
    { name: 'Applications', value: myApplications.length },
    { name: 'Hires', value: hiredCount },
  ];

  const usersStr = localStorage.getItem('worksphere_users');
  const allUsers: (any)[] = usersStr ? JSON.parse(usersStr) : MOCK_USERS;

  const employerReviewsList = employerReviews.filter(r => r.employerId === employer.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-400">{employer.companyName} Workspace</p>
        </div>
        <Button onClick={() => navigate('/employer/jobs/create')} className="gap-2">
          <PlusCircle className="w-4 h-4" />
          Post New Job
        </Button>
      </div>

      {/* Row 1 Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-400">Active Jobs</p>
              <Briefcase className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold">{activeJobsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-400">Total Applications</p>
              <Users className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{myApplications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-400">Successful Hires</p>
              <Clock className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold">{hiredCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-400">Employer Rating</p>
              <Star className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <div className="text-2xl font-bold">{(myStats?.rating ?? employer.rating ?? 0).toFixed(1)}</div>
              <span className="text-xs text-slate-500">/ 5.0</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2 Audit & Trust Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-indigo-500/20 bg-indigo-505/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-indigo-400">Employer Trust Score</p>
              <ShieldCheck className="h-5 w-5 text-indigo-400 fill-indigo-400/20" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <div className="text-3xl font-black text-indigo-200">{myStats?.trustScore ?? 0}</div>
              <span className="text-xs text-indigo-500">/ 100 points</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/10 bg-amber-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-amber-400">Positive Review Percentage</p>
              <Star className="h-5 w-5 text-amber-400 fill-amber-400/20" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <div className="text-3xl font-black text-amber-200">{myStats?.positivePct ?? 100}%</div>
              <span className="text-xs text-amber-500">of reviews are 4★+</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/10 bg-emerald-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-emerald-400">Total Reviews Received</p>
              <Users className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <div className="text-3xl font-black text-emerald-200">{myStats?.reviewCount ?? 0}</div>
              <span className="text-xs text-emerald-500">worker reviews</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-xs font-semibold uppercase text-slate-400">Total Applicants</p>
          <p className="text-2xl font-bold mt-1 text-slate-200">{myApplications.length}</p>
        </div>
        <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4 text-center">
          <p className="text-xs font-semibold uppercase text-indigo-400">Under Review</p>
          <p className="text-2xl font-bold mt-1 text-indigo-400">
            {myApplications.filter(a => a.status === 'Under Review').length}
          </p>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 text-center">
          <p className="text-xs font-semibold uppercase text-amber-400">Shortlisted</p>
          <p className="text-2xl font-bold mt-1 text-amber-400">
            {myApplications.filter(a => a.status === 'Shortlisted').length}
          </p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 text-center">
          <p className="text-xs font-semibold uppercase text-emerald-400">Accepted</p>
          <p className="text-2xl font-bold mt-1 text-emerald-400">
            {myApplications.filter(a => a.status === 'Accepted' || a.status === 'Hired').length}
          </p>
        </div>
        <div className="bg-rose-500/5 border border-rose-500/15 rounded-xl p-4 col-span-2 lg:col-span-1 text-center">
          <p className="text-xs font-semibold uppercase text-rose-400">Rejected</p>
          <p className="text-2xl font-bold mt-1 text-rose-400">
            {myApplications.filter(a => a.status === 'Rejected').length}
          </p>
        </div>
      </div>

      {/* Main grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Candidate Evaluation */}
        <Card>
          <CardHeader>
            <CardTitle>Candidate Evaluation Center</CardTitle>
            <CardDescription>Review workers from completed jobs</CardDescription>
          </CardHeader>
          <CardContent>
            {completedApplications.length > 0 ? (
              <div className="space-y-6">
                {completedApplications.map(app => {
                   const seeker = allUsers.find(u => u.id === app.seekerId) as SeekerProfile;
                   const hasReviewed = seekerReviews.some(r => r.applicationId === app.id);
                   const job = jobs.find(j => j.id === app.jobId);
                   return (
                     <div key={app.id} className="border border-slate-800 rounded-xl p-6 bg-slate-900/50">
                        <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-4">
                           <div>
                              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                {seeker?.name} 
                                {seeker?.trustBadges?.includes('Verified Skill') && <ShieldCheck className="w-4 h-4 text-emerald-400"/>}
                              </h3>
                              <p className="text-sm text-slate-400">Job: {job?.title}</p>
                           </div>
                           <Badge variant={hasReviewed ? 'success' : 'warning'}>
                             {hasReviewed ? 'Evaluated' : 'Pending Review'}
                           </Badge>
                        </div>
                        
                        <CandidateEvaluationRow seeker={seeker} />

                        {!hasReviewed && (
                          <div className="mt-6 border-t border-slate-800 pt-6">
                             <EmployerReviewForm app={app} employerId={employer.id} onSubmit={addSeekerReview} />
                          </div>
                        )}
                        {hasReviewed && (
                          <div className="mt-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                               <CheckCircle2 className="w-4 h-4" /> Review successfully published.
                            </p>
                          </div>
                        )}
                     </div>
                   );
                })}
              </div>
            ) : (
               <div className="text-center py-8 text-slate-400 text-sm">
                 <p>No completed jobs pending evaluation.</p>
                 <p className="text-xs mt-1">Mark an active hire as Completed to evaluate them here.</p>
               </div>
            )}
          </CardContent>
        </Card>

        {/* Employer reviews and ratings history */}
        <Card>
          <CardHeader>
            <CardTitle>My Worker Reviews & Ratings</CardTitle>
            <CardDescription>Verified feedback and audits submitted by your gig workers</CardDescription>
          </CardHeader>
          <CardContent>
            {employerReviewsList.length > 0 ? (
              <div className="space-y-4">
                {employerReviewsList.map(review => {
                  const seeker = allUsers.find(u => u.id === review.seekerId) as SeekerProfile | undefined;
                  return (
                    <div key={review.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold text-slate-200">
                            {seeker?.name || 'Verified Seeker'}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star 
                                key={star} 
                                className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-800'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 block">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>

                      {review.categories && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400 border-y border-slate-900 py-1.5">
                          {review.categories.workEnvironment !== undefined && (
                            <span>Work Env: <span className="text-slate-300 font-bold">{review.categories.workEnvironment}/5</span></span>
                          )}
                          {review.categories.paymentFairness !== undefined && (
                            <span>Payment: <span className="text-slate-300 font-bold">{review.categories.paymentFairness}/5</span></span>
                          )}
                          {review.categories.communication !== undefined && (
                            <span>Comm: <span className="text-slate-300 font-bold">{review.categories.communication}/5</span></span>
                          )}
                          {review.categories.professionalism !== undefined && (
                            <span>Professionalism: <span className="text-slate-300 font-bold">{review.categories.professionalism}/5</span></span>
                          )}
                          {review.categories.jobAccuracy !== undefined && (
                            <span>Job Accuracy: <span className="text-slate-300 font-bold">{review.categories.jobAccuracy}/5</span></span>
                          )}
                        </div>
                      )}

                      {review.comment ? (
                        <p className="text-sm text-slate-300 leading-relaxed italic">"{review.comment}"</p>
                      ) : (
                        <p className="text-sm text-slate-500 italic">No feedback comment shared.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
                 No worker reviews received yet.
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

function CandidateEvaluationRow({ seeker }: { seeker: SeekerProfile }) {
  const stats = useUserStats(seeker);
  
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900 rounded-xl p-4">
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Candidate Rating</p>
        <p className="text-xl font-bold flex items-center gap-1.5 text-amber-400">
           <Star className="w-5 h-5 fill-current" /> {stats.rating} 
           <span className="text-sm text-slate-500 font-normal ml-1">({stats.reviewCount})</span>
        </p>
      </div>
      <div>
         <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Trust Score</p>
         <p className="text-xl font-bold text-emerald-400">{stats.trustScore}/100</p>
      </div>
      <div>
         <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Completed Jobs</p>
         <p className="text-xl font-bold text-slate-100">{stats.completedJobs}</p>
      </div>
      <div>
         <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Certifications</p>
         <p className="text-xl font-bold text-slate-100">{seeker.certifications?.length || 0}</p>
      </div>
      <div className="col-span-2 md:col-span-4 mt-2">
         <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Trust Badges</p>
         <div className="flex flex-wrap gap-2">
           {stats.badges.map(b => (
             <Badge key={b} variant="success" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5 mr-1" />{b}</Badge>
           ))}
           {stats.badges.length === 0 && <span className="text-sm text-slate-500">None</span>}
         </div>
      </div>
    </div>
  )
}

function EmployerReviewForm({ app, employerId, onSubmit }: { app: Application, employerId: string, onSubmit: (r: any) => void }) {
  const [categories, setCategories] = useState({
    skillQuality: 0,
    workCompletion: 0,
    punctuality: 0,
    communication: 0,
    professionalism: 0
  });
  const [comment, setComment] = useState('');

  const handleRate = (cat: keyof typeof categories, val: number) => {
    setCategories(prev => ({...prev, [cat]: val}));
  };

  const submit = () => {
    const vals = Object.values(categories) as number[];
    const avg = vals.reduce((a,b)=>a+b,0) / 5;
    onSubmit({
      applicationId: app.id,
      employerId,
      seekerId: app.seekerId,
      rating: Number(avg.toFixed(1)),
      comment,
      categories
    });
  };

  const isReady = (Object.values(categories) as number[]).every(v => v > 0) && comment.length > 5;

  return (
    <div className="space-y-6">
      <h4 className="text-sm font-semibold mb-4">Evaluate Candidate</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(categories).map(([k, v]) => (
          <div key={k} className="flex justify-between items-center bg-slate-900 border border-white/5 p-3 rounded-lg">
            <span className="text-sm text-slate-300 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(star => (
                <button key={star} onClick={() => handleRate(k as any, star)} className="hover:scale-110 transition-transform">
                  <Star className={`w-5 h-5 ${star <= (v as number) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div>
        <textarea 
          placeholder="Leave a written review (required)"
          className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[100px]"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
      </div>
      <Button disabled={!isReady} onClick={submit} className="w-full">
        Submit Evaluation
      </Button>
    </div>
  );
}
