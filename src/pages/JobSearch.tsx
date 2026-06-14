import React, { useState } from 'react';
import { useAppData } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../lib/Card';
import { Badge } from '../lib/Badge';
import { Button } from '../lib/Button';
import { Input } from '../lib/Input';
import { Search, MapPin, Building2, CheckCircle2, AlertTriangle, ShieldCheck, Star, Heart, BookOpen } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { SeekerProfile, EmployerProfile } from '../types';
import { MOCK_USERS } from '../data/mock';

export function JobSearch() {
  const { jobs, standards, applications, savedJobs, toggleSaveJob, applyForJob, employerReviews } = useAppData();
  const { profile } = useAuth();

  const usersStr = localStorage.getItem('worksphere_users');
  const allUsers: (any)[] = usersStr ? JSON.parse(usersStr) : MOCK_USERS;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEmployer, setSelectedEmployer] = useState<EmployerProfile | null>(null);
  const [expandedSkillGap, setExpandedSkillGap] = useState<Record<string, boolean>>({});
  
  const seekerProfile = profile as SeekerProfile;

  const toggleSkillGap = (jobId: string) => {
    setExpandedSkillGap(prev => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  const filteredJobs = jobs.filter(job => {
    if (job.status !== 'active') return false;
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(jobs.map(j => j.category)))];

  const handleApply = (jobId: string, baseMatchScore: number) => {
    if (seekerProfile) {
      applyForJob(jobId, seekerProfile.id, baseMatchScore);
      alert('Application submitted successfully!');
    }
  };

  const hasApplied = (jobId: string) => {
    return applications.some(a => a.jobId === jobId && a.seekerId === seekerProfile?.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Find Your Next Job</h1>
        <p className="text-slate-400">Discover opportunities that match your skills and offer fair compensation.</p>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
             <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
             <Input 
               placeholder="Search by keyword, role, or skill..." 
               className="pl-9"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <select 
            className="h-10 rounded-md border border-white/10 glass bg-slate-900/50 px-3 text-sm text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <Button>Search</Button>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => {
            // Fair wage calculation
            const standard = standards.find(s => job.category.toLowerCase().includes(s.category.toLowerCase()));
            let wageStatus = 'unknown'; // unknown, fair, below, above
            if (standard) {
              if (job.salaryType === standard.type) {
                if (job.salaryMax < standard.min) wageStatus = 'below';
                else if (job.salaryMin >= standard.max) wageStatus = 'above';
                else wageStatus = 'fair';
              }
            }

            // Pseudo match score
            let matchScore = 20;
            const employerObj = allUsers.find(u => u.id === job.employerId) as EmployerProfile | undefined;
            
            // Calculate dynamic employer stats
            const empReviews = employerReviews.filter(r => r.employerId === job.employerId);
            const reviewCount = empReviews.length;
            const dynamicRating = reviewCount > 0 
              ? empReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount 
              : (employerObj?.rating || 0);
            const totalReviewCount = Math.max(reviewCount, employerObj?.reviewCount || 0);

            const employerStats = {
              rating: dynamicRating,
              reviewCount: totalReviewCount
            };

            const userSkillNames = seekerProfile?.skills?.map(s => s.name.toLowerCase()) || [];

            if (seekerProfile) {
              if (seekerProfile.skills && seekerProfile.skills.length > 0) {
                const matchedSkills = job.requiredSkills.filter(reqSkill => 
                  userSkillNames.some(userSkill => userSkill.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(userSkill))
                );
                if (job.requiredSkills.length > 0) {
                  matchScore += Math.round((matchedSkills.length / job.requiredSkills.length) * 30);
                }
              }

              if (seekerProfile.location && (seekerProfile.location.toLowerCase().includes(job.location.toLowerCase()) || job.location === 'Remote')) {
                matchScore += 15;
              }

              if (seekerProfile.preferredCategories && seekerProfile.preferredCategories.includes(job.category)) {
                matchScore += 15;
              }

              if (seekerProfile.preferredWorkTypes && seekerProfile.preferredWorkTypes.some(t => job.employmentType.toLowerCase().includes(t.toLowerCase()))) {
                matchScore += 10;
              }

              if (seekerProfile.experience && seekerProfile.experience.length > 0) {
                matchScore += 10;
              }

              matchScore = Math.min(matchScore, 99);
            }

            // Skill Gap Analysis variables
            const matchedSkillsList = job.requiredSkills.filter(reqSkill => 
              userSkillNames.some(userS => userS.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(userS))
            );
            const missingSkillsList = job.requiredSkills.filter(reqSkill => 
              !userSkillNames.some(userS => userS.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(userS))
            );

            const isApplied = hasApplied(job.id);
            const isSaved = seekerProfile && savedJobs.some(item => item.userId === seekerProfile.id && item.jobId === job.id);

            return (
              <Card key={job.id} id={`job-card-${job.id}`} className="overflow-hidden transition-all hover:border-slate-700">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div>
                        <div className="flex items-start justify-between">
                          <h3 className="text-xl font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
                            {job.title}
                          </h3>

                          {/* Save/Remove Action heart button */}
                          {seekerProfile && (
                            <Button 
                              id={`save-btn-${job.id}`}
                              type="button"
                              variant="ghost" 
                              size="sm" 
                              onClick={() => toggleSaveJob(seekerProfile.id, job.id)}
                              className={`${isSaved ? 'text-indigo-400' : 'text-slate-500 hover:text-indigo-400'} transition-colors p-2`}
                              title={isSaved ? "Remove from saved" : "Save job"}
                            >
                              <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                            </Button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-400">
                          <button 
                            type="button"
                            onClick={() => {
                              if (employerObj) setSelectedEmployer(employerObj);
                            }}
                            className="flex items-center gap-1.5 font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer bg-transparent border-none p-0 align-baseline"
                          >
                            <Building2 className="w-4 h-4" />
                            {job.companyName || employerObj?.companyName || 'TechCorp Solutions'}
                          </button>
                          
                          {employerStats.reviewCount > 0 && (
                             <>
                               <span>•</span>
                               <button 
                                 type="button"
                                 onClick={() => {
                                   if (employerObj) setSelectedEmployer(employerObj);
                                 }}
                                 className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium cursor-pointer bg-transparent border-none p-0 align-baseline"
                               >
                                 <Star className="w-3.5 h-3.5 fill-current" />
                                 {employerStats.rating.toFixed(1)} 
                                 <span className="text-slate-500 font-normal text-xs ml-0.5">({employerStats.reviewCount} reviews)</span>
                               </button>
                             </>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span>•</span>
                          <span>{job.employmentType}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-slate-100">
                            {formatCurrency(job.salaryMin)} - {formatCurrency(job.salaryMax)}
                          </span>
                          <span className="text-sm text-slate-500">/{job.salaryType}</span>
                        </div>
                        
                        {wageStatus === 'fair' && (
                          <Badge variant="success" className="gap-1 px-2 py-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Fair Wage
                          </Badge>
                        )}
                        {wageStatus === 'below' && (
                          <Badge variant="warning" className="gap-1 px-2 py-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Below Market
                          </Badge>
                        )}
                        {wageStatus === 'above' && (
                          <Badge variant="success" className="gap-1 px-2 py-1 border-emerald-400/50 bg-emerald-500/20 text-emerald-300">
                            <ShieldCheck className="w-3.5 h-3.5" /> High Paying
                          </Badge>
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-slate-300 leading-relaxed">{job.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.map(skill => (
                          <Badge key={skill} variant="secondary" className="bg-slate-800 text-slate-300 border-transparent">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-stretch md:items-end justify-between min-w-[160px] pl-0 md:pl-4 md:border-l border-slate-800 gap-4">
                      <div className="text-left md:text-right">
                         <div className="flex items-center md:justify-end gap-1 text-emerald-400 font-bold">
                           <ShieldCheck className="w-4 h-4" />
                           {matchScore}% Match
                         </div>
                         <p className="text-xs text-slate-500 mt-1">based on your profile</p>
                      </div>
                      <div className="w-full space-y-2">
                        {seekerProfile && (
                          <Button 
                            id={`view-gap-btn-${job.id}`}
                            variant="secondary" 
                            size="sm" 
                            onClick={() => toggleSkillGap(job.id)}
                            className="w-full text-xs gap-1"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            {expandedSkillGap[job.id] ? 'Hide Skill Gap' : 'View Skill Gap'}
                          </Button>
                        )}

                        {isApplied ? (
                          <Button className="w-full" variant="outline" disabled>Applied</Button>
                        ) : (
                          <Button className="w-full" onClick={() => handleApply(job.id, matchScore)}>Quick Apply</Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* FEATURE 3: SKILL GAP ANALYSIS container */}
                  {seekerProfile && expandedSkillGap[job.id] && (
                    <div className="mt-4 p-5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-4 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-indigo-400" />
                          Skill Gap Analysis
                        </h4>
                        <Badge variant={matchScore >= 80 ? 'success' : matchScore >= 50 ? 'warning' : 'outline'}>
                          Match Score: {matchScore}%
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">Skills Already Available</p>
                          <div className="flex flex-wrap gap-1.5">
                            {matchedSkillsList.length > 0 ? (
                              matchedSkillsList.map(skill => (
                                <Badge key={skill} variant="success" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 py-0.5">
                                  ✓ {skill}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-slate-500 italic">No matching skills in your profile yet.</span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">Missing Skills For This Job</p>
                          <div className="flex flex-wrap gap-1.5">
                            {missingSkillsList.length > 0 ? (
                              missingSkillsList.map(skill => (
                                <Badge key={skill} variant="secondary" className="bg-rose-500/10 text-rose-400 border-rose-500/20 py-0.5">
                                  ✗ {skill}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-emerald-400 font-medium">✓ You meet all skill requirements!</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {missingSkillsList.length > 0 && (
                        <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-lg p-3 space-y-2">
                          <p className="text-xs font-bold text-indigo-300 uppercase tracking-wide">Recommended Learning Path</p>
                          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                            {missingSkillsList.map((skill, index) => (
                              <li key={skill}>
                                Step {index + 1}: Learn <span className="text-slate-100 font-semibold">{skill}</span> to close the gap. Explore certifications or documentation for {skill}.
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12 text-slate-500">
            {jobs.length === 0 ? (
              "No active employer-posted jobs available yet."
            ) : (
              "No jobs found matching your criteria."
            )}
          </div>
        )}
      </div>

      {/* Employer Profile & Review History Modal */}
      {selectedEmployer && (() => {
        const empReviews = employerReviews.filter(r => r.employerId === selectedEmployer.id);
        const reviewCount = empReviews.length;
        const rating = reviewCount > 0 
          ? empReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount 
          : (selectedEmployer.rating || 0);
        const totalReviewsCount = Math.max(reviewCount, selectedEmployer.reviewCount || 0);

        const positiveReviews = empReviews.filter(r => r.rating >= 4).length;
        const positivePct = reviewCount > 0 ? Math.round((positiveReviews / reviewCount) * 105) : 100;
        const safePositivePct = Math.min(positivePct, 100);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    {selectedEmployer.companyName}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">{selectedEmployer.industry || 'Information Technology'} • {selectedEmployer.location || 'Bangalore, KA'}</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setSelectedEmployer(null)} 
                  className="text-slate-400 hover:text-slate-200 transition-colors p-1 bg-slate-800/40 hover:bg-slate-800 rounded-lg text-sm font-bold w-7 h-7 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* About Company */}
                {selectedEmployer.description && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-300">About Company</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{selectedEmployer.description}</p>
                  </div>
                )}

                {/* Employer Reviews & Ratings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2">Employer Reviews & Ratings</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/40 text-center flex flex-col justify-center items-center">
                      <span className="text-xs text-slate-400 uppercase tracking-wide">Average Rating</span>
                      <span className="text-3xl font-bold text-slate-100 mt-1">{rating.toFixed(1)}</span>
                      <div className="flex gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star} 
                            className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} 
                          />
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/40 text-center flex flex-col justify-center items-center">
                      <span className="text-xs text-slate-400 uppercase tracking-wide">Total Reviews</span>
                      <span className="text-3xl font-bold text-slate-100 mt-1">{totalReviewsCount}</span>
                      <span className="text-xs text-slate-500 mt-1">Based on workers' audits</span>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/40 text-center flex flex-col justify-center items-center">
                      <span className="text-xs text-slate-400 uppercase tracking-wide">Positive Review %</span>
                      <span className="text-3xl font-bold text-emerald-400 mt-1">{safePositivePct}%</span>
                      <span className="text-xs text-slate-500 mt-1">Rating of 4★ or above</span>
                    </div>
                  </div>

                  {/* Recent Reviews List (REAL ONLY) */}
                  <div className="space-y-3 mt-4">
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Recent Reviews</span>
                    {empReviews.length > 0 ? (
                      <div className="space-y-4">
                        {empReviews.map(review => (
                          <div key={review.id} className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star 
                                    key={star} 
                                    className={`w-4 h-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-800'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>

                            {/* Breakdown */}
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
                              <p className="text-sm text-slate-300 italic">"{review.comment}"</p>
                            ) : (
                              <p className="text-sm text-slate-500 italic">No comment provided.</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-slate-950 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
                        No verified worker reviews submitted yet for this employer.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                <Button onClick={() => setSelectedEmployer(null)} size="sm" variant="secondary">
                  Close Profile
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
