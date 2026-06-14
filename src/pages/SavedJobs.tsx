import React, { useState } from 'react';
import { useAppData } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../lib/Card';
import { Badge } from '../lib/Badge';
import { Button } from '../lib/Button';
import { MapPin, Building2, CheckCircle2, AlertTriangle, ShieldCheck, Star, Heart, FileText, ChevronRight, BookOpen } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { SeekerProfile, EmployerProfile } from '../types';
import { MOCK_USERS } from '../data/mock';
import { useNavigate } from 'react-router-dom';

export function SavedJobs() {
  const { jobs, standards, applications, savedJobs, toggleSaveJob, applyForJob, employerReviews } = useAppData();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const usersStr = localStorage.getItem('worksphere_users');
  const allUsers: (any)[] = usersStr ? JSON.parse(usersStr) : MOCK_USERS;

  const seekerProfile = profile as SeekerProfile;

  // Filter saved jobs linked to this correct user
  const mySavedItems = savedJobs.filter(item => item.userId === seekerProfile?.id);
  const mySavedJobIds = mySavedItems.map(item => item.jobId);
  const mySavedJobs = jobs.filter(job => mySavedJobIds.includes(job.id) && job.status === 'active');

  const [expandedSkillGap, setExpandedSkillGap] = useState<Record<string, boolean>>({});

  const toggleSkillGap = (jobId: string) => {
    setExpandedSkillGap(prev => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  const hasApplied = (jobId: string) => {
    return applications.some(a => a.jobId === jobId && a.seekerId === seekerProfile?.id);
  };

  const handleApply = (jobId: string, baseMatchScore: number) => {
    if (seekerProfile) {
      applyForJob(jobId, seekerProfile.id, baseMatchScore);
      alert('Application submitted successfully!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Saved Jobs</h1>
          <p className="text-slate-400">Keep track of opportunities you are interested in and review your skill readiness.</p>
        </div>
        <Button onClick={() => navigate('/seeker/jobs')} variant="outline" className="gap-2">
          Explore More Jobs
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {mySavedJobs.length > 0 ? (
          mySavedJobs.map(job => {
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

            const employerObj = allUsers.find(u => u.id === job.employerId) as EmployerProfile | undefined;
            const empReviews = employerReviews.filter(r => r.employerId === job.employerId);
            const reviewCount = empReviews.length;
            const dynamicRating = reviewCount > 0 
              ? empReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount 
              : (employerObj?.rating || 0);
            const totalReviewCount = Math.max(reviewCount, employerObj?.reviewCount || 0);

            // Pseudo match score calculation
            let matchScore = 20;
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

            return (
              <Card key={job.id} id={`saved-job-card-${job.id}`} className="overflow-hidden border-slate-800 bg-slate-900/30">
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div>
                        <div className="flex items-start justify-between">
                          <h3 className="text-xl font-semibold text-slate-100">{job.title}</h3>
                          
                          {/* Save/Remove Saved Job toggler button */}
                          <Button 
                            id={`unsave-btn-${job.id}`}
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleSaveJob(seekerProfile.id, job.id)}
                            className="text-indigo-400 hover:text-rose-400 transition-colors p-2"
                            title="Remove from saved jobs"
                          >
                            <Heart className="w-5 h-5 fill-current" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-400">
                          <span className="flex items-center gap-1.5 font-medium text-slate-300">
                            <Building2 className="w-4 h-4 text-slate-500" />
                            {employerObj?.companyName || 'Verified Corporate Employer'}
                          </span>
                          {totalReviewCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-amber-400 font-medium">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                {dynamicRating.toFixed(1)} 
                                <span className="text-slate-500 font-normal text-xs ml-0.5">({totalReviewCount} reviews)</span>
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-slate-500" />
                            {job.location}
                          </span>
                          <span>•</span>
                          <span className="bg-slate-800/60 px-2 py-0.5 rounded text-xs text-slate-300">{job.employmentType}</span>
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

                      <p className="text-sm text-slate-300 leading-relaxed">{job.description}</p>
                    </div>

                    <div className="flex flex-col items-stretch md:items-end justify-between min-w-[160px] pl-0 md:pl-6 md:border-l border-slate-800 gap-4">
                      <div className="text-left md:text-right">
                        <div className="flex items-center md:justify-end gap-1 text-emerald-400 font-bold text-lg">
                          <ShieldCheck className="w-5 h-5" />
                          {matchScore}% Match
                        </div>
                        <p className="text-xs text-slate-500 mt-1">based on your active skills</p>
                      </div>

                      <div className="space-y-2 w-full">
                        <Button 
                          id={`toggle-gap-btn-${job.id}`}
                          variant="secondary" 
                          size="sm" 
                          onClick={() => toggleSkillGap(job.id)}
                          className="w-full text-xs gap-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          {expandedSkillGap[job.id] ? 'Hide Skill Gap' : 'View Skill Gap'}
                        </Button>

                        {isApplied ? (
                          <Button className="w-full" variant="outline" disabled>Applied</Button>
                        ) : (
                          <Button className="w-full" onClick={() => handleApply(job.id, matchScore)}>Quick Apply</Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* FEATURE 3: SKILL GAP ANALYSIS block inside card */}
                  {expandedSkillGap[job.id] && (
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
          <Card>
            <CardContent className="p-12 text-center text-slate-400 text-sm space-y-3">
              <Heart className="w-12 h-12 stroke-slate-600 mx-auto" />
              <p className="font-medium text-slate-300 text-base">Your saved jobs folder is empty</p>
              <p className="text-xs max-w-sm mx-auto">Click "Find Jobs" to explore vacancies and hit the Heart icon on any job card to save it for later review.</p>
              <Button onClick={() => navigate('/seeker/jobs')} size="sm" className="mt-4">
                Find Jobs Now
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
