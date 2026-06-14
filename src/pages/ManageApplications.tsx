import React, { useState } from 'react';
import { useAppData } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../lib/Card';
import { Badge } from '../lib/Badge';
import { MOCK_USERS } from '../data/mock';
import { Button } from '../lib/Button';
import { 
  ShieldCheck, 
  CheckCircle2, 
  User as UserIcon, 
  X, 
  Download, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Award, 
  FileText,
  Star
} from 'lucide-react';

function getSeekerStats(applicant: any, seekerReviews: any[], applications: any[]) {
  if (!applicant) return { rating: 0, reviewCount: 0, completedJobs: 0, trustScore: 0, badges: [] };
  const myReviews = seekerReviews.filter(r => r.seekerId === applicant.id);
  const myApps = applications.filter(a => a.seekerId === applicant.id && a.status === 'Completed');
  
  const reviewCount = myReviews.length;
  const rating = reviewCount > 0 ? myReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;
  const completedJobs = myApps.length + (applicant.completedJobs || 0);

  let avgPunctuality = 0;
  if (reviewCount > 0) {
    avgPunctuality = myReviews.reduce((sum, r) => sum + (r.categories?.punctuality || 0), 0) / reviewCount;
  }

  // Calculate Trust Score (0-100)
  let score = 0;
  score += rating * 8; // Max 40
  score += Math.min(completedJobs * 4, 20); // Max 20
  score += Math.min((applicant.certifications?.length || 0) * 5, 10); // Max 10
  score += (((applicant.profileCompletion || 0) / 100) * 15); // Max 15
  
  const newBadges = new Set<string>(applicant.trustBadges || []);
  
  if (applicant.certifications && applicant.certifications.length > 0) newBadges.add('Verified Skill');
  if (applicant.profileCompletion === 100) newBadges.add('Profile Complete');
  else newBadges.delete('Profile Complete');

  if (score >= 60) newBadges.add('⭐ Trusted Candidate');
  if (rating >= 4.5 && reviewCount >= 1) newBadges.add('🏆 Top Rated Worker');
  if (avgPunctuality >= 4.5 && reviewCount >= 1) newBadges.add('✔ Reliable Professional');
  if (completedJobs >= 2) newBadges.add('🥇 Consistent Performer');

  score += Math.min(newBadges.size * 3, 15); // Add up to 15 points for badges
  const finalScore = Math.min(Math.round(score), 100);

  return {
    rating: Number(rating.toFixed(1)),
    reviewCount,
    completedJobs,
    trustScore: finalScore,
    badges: Array.from(newBadges)
  };
}

export function ManageApplications() {
  const { profile } = useAuth();
  const { jobs, applications, seekerReviews = [], updateApplicationStatus } = useAppData();
  const [selectedApplicant, setSelectedApplicant] = useState<{ applicant: any; application: any } | null>(null);

  // Load the active list of user profiles from localStorage
  const usersStr = localStorage.getItem('worksphere_users');
  const allUsers: (any)[] = usersStr ? JSON.parse(usersStr) : MOCK_USERS;

  // Use local state for filtering so clearing filters is fast and reactive.
  const [selectedJobIdFilter, setSelectedJobIdFilter] = useState<string | null>(
    new URLSearchParams(window.location.search).get('jobId')
  );

  if (!profile) return null;

  // Filter jobs and applications for this employer
  const myJobs = jobs.filter(j => j.employerId === profile.id);
  const myJobIds = myJobs.map(j => j.id);
  const myApplications = applications.filter(a => myJobIds.includes(a.jobId));

  const filteredApplications = selectedJobIdFilter 
    ? myApplications.filter(a => a.jobId === selectedJobIdFilter)
    : myApplications;

  const currentFilterJob = selectedJobIdFilter ? jobs.find(j => j.id === selectedJobIdFilter) : null;

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
  };

  const handleMockDownload = (name: string) => {
    const blob = new Blob([`Mock file content for ${name}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review Applications</h1>
          <p className="text-slate-400">Manage candidates and update their application status.</p>
        </div>
        {selectedJobIdFilter && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setSelectedJobIdFilter(null);
            }}
          >
            Show All Applications
          </Button>
        )}
      </div>

      {currentFilterJob && (
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-indigo-400 tracking-wider">Filtered View</p>
            <p className="text-sm text-slate-200 mt-0.5">Showing candidates for <span className="font-semibold text-white">{currentFilterJob.title}</span></p>
          </div>
          <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-300">
            {filteredApplications.length} Applicant{filteredApplications.length === 1 ? '' : 's'}
          </Badge>
        </div>
      )}

      <div className="space-y-4">
        {filteredApplications.length > 0 ? (
          filteredApplications.map(app => {
            const job = myJobs.find(j => j.id === app.jobId) || jobs.find(j => j.id === app.jobId);
            const applicant = allUsers.find(u => u.id === app.seekerId);
            
            if (!job || !applicant || applicant.role !== 'seeker') return null;

            const applicantStats = getSeekerStats(applicant, seekerReviews, applications);
            const liveBadges = applicantStats.badges;
            const resumeName = applicant.resumeUrl || (applicant.id === 's1' ? 'Rahul_Sharma_Resume.pdf' : '');
            const hasResume = !!resumeName;

            return (
              <Card key={app.id} className="border-slate-800/80 hover:border-slate-700/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    
                    {/* Candidate Details & Credentials */}
                    <div className="space-y-4 flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                          {applicant.avatar ? (
                            <img src={applicant.avatar} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" alt={applicant.name} />
                          ) : (
                            <UserIcon className="w-6 h-6 text-slate-400" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-slate-100">{applicant.name}</h3>
                            {liveBadges.includes('Verified Skill') && (
                              <ShieldCheck className="w-4 h-4 text-emerald-400" title="Verified Skill" />
                            )}
                            <div className="flex gap-1 flex-wrap">
                              {liveBadges.map(badge => (
                                <Badge key={badge} variant="success" className="text-[10px] py-0 px-2 scale-90 origin-left">
                                  {badge}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">
                            Applying for: <span className="text-indigo-400 font-semibold">{job.title}</span>
                          </p>
                        </div>
                      </div>

                      {/* Information Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-sm">
                        <div>
                          <p className="text-slate-500 text-xs font-semibold">Match score</p>
                          <p className="font-bold text-indigo-400 mt-0.5">{app.matchScore}% Match</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs font-semibold">Profile completion</p>
                          <p className="font-semibold text-slate-300 mt-0.5">{applicant.profileCompletion || 0}%</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs font-semibold">Resume available</p>
                          <div className="mt-0.5">
                            {hasResume ? (
                              <Badge variant="success" className="text-xs">Yes</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-slate-500">No</Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs font-semibold">Location</p>
                          <p className="font-medium text-slate-300 mt-0.5 truncate">{applicant.location || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs font-semibold">Experience</p>
                          <p className="font-medium text-slate-300 mt-0.5 truncate" title={applicant.experience?.[0] || 'None'}>
                            {applicant.experience?.[0] || 'No experience'}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs font-semibold">Education</p>
                          <p className="font-medium text-slate-300 mt-0.5 truncate" title={applicant.education?.[0] || 'None'}>
                            {applicant.education?.[0] || 'No education'}
                          </p>
                        </div>
                      </div>

                      {/* Skills List */}
                      <div>
                        <p className="text-slate-500 text-xs font-semibold mb-1.5">Key Skills</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {applicant.skills?.slice(0, 5).map(s => (
                            <Badge key={s.name} variant={s.verified ? "secondary" : "outline"} className={s.verified ? "border-purple-500/30 text-purple-300 text-xs" : "text-xs"}>
                              {s.name} {s.verified && <CheckCircle2 className="w-3" />}
                            </Badge>
                          ))}
                          {applicant.skills && applicant.skills.length > 5 && (
                            <span className="text-xs text-slate-500 pt-0.5">+{applicant.skills.length - 5} more</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions and Status Column */}
                    <div className="flex flex-col xs:flex-row lg:flex-col items-stretch lg:items-end justify-between gap-4 min-w-[200px] lg:pl-6 lg:border-l border-slate-800">
                      <div className="flex items-center justify-between lg:justify-end gap-2 w-full">
                        <span className="text-xs text-slate-500 lg:hidden font-semibold">Status:</span>
                        <Badge variant={getStatusColor(app.status)} className="font-bold">
                          {app.status === 'Hired' || app.status === 'Accepted' ? 'Accepted' : app.status}
                        </Badge>
                      </div>

                      <div className="flex flex-col gap-2 w-full">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-xs font-medium" 
                          onClick={() => setSelectedApplicant({ applicant, application: app })}
                        >
                          View Full Profile
                        </Button>

                        {/* Decision Workflows */}
                        {['Applied', 'Under Review'].includes(app.status) && (
                          <>
                            <div className="grid grid-cols-2 gap-2">
                              {app.status === 'Applied' && (
                                <Button 
                                  size="sm"
                                  className="text-xs flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300" 
                                  onClick={() => updateApplicationStatus(app.id, 'Under Review')}
                                >
                                  Review
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                className="text-xs flex-1 bg-amber-600 hover:bg-amber-700 text-white" 
                                onClick={() => updateApplicationStatus(app.id, 'Shortlisted')}
                              >
                                Shortlist
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                size="sm" 
                                className="text-xs flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" 
                                onClick={() => updateApplicationStatus(app.id, 'Accepted')}
                              >
                                Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="danger" 
                                className="text-xs flex-1" 
                                onClick={() => updateApplicationStatus(app.id, 'Rejected')}
                              >
                                Reject
                              </Button>
                            </div>
                          </>
                        )}

                        {app.status === 'Shortlisted' && (
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              size="sm" 
                              className="text-xs flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" 
                              onClick={() => updateApplicationStatus(app.id, 'Accepted')}
                            >
                              Accept Candidate
                            </Button>
                            <Button 
                              size="sm" 
                              variant="danger" 
                              className="text-xs flex-1" 
                              onClick={() => updateApplicationStatus(app.id, 'Rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        )}

                        {(app.status === 'Accepted' || app.status === 'Hired') && (
                          <div className="text-center w-full flex flex-col gap-2">
                            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-left">
                              <p className="text-[11px] text-emerald-400 font-bold mb-0.5 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Candidate Hired
                              </p>
                              <p className="text-[10px] text-slate-400">Escrow funds secured and locked.</p>
                            </div>
                            <Button 
                              className="w-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white" 
                              onClick={() => updateApplicationStatus(app.id, 'Completed')}
                            >
                              Mark Job Completed
                            </Button>
                          </div>
                        )}

                        {app.status === 'Completed' && (
                          <div className="text-center w-full p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                             <p className="text-xs text-indigo-400 font-bold mb-0.5">Job Completed</p>
                             <p className="text-[10px] text-slate-400">Escrow payment released.</p>
                          </div>
                        )}

                        {app.status === 'Rejected' && (
                          <div className="text-center w-full p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/10">
                            <p className="text-xs text-rose-400 font-medium">Candidate Rejected</p>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12 text-slate-500 rounded-xl border border-slate-900 bg-slate-950/20">
            No applications found matching your criteria.
          </div>
        )}
      </div>

      {/* VIEW FULL PROFILE MODAL */}
      {(() => {
        if (!selectedApplicant) return null;
        const actualSelectedApplicant = allUsers.find(u => u.id === selectedApplicant.application.seekerId) || selectedApplicant.applicant;
        const modalStats = getSeekerStats(actualSelectedApplicant, seekerReviews, applications);
        const modalBadges = modalStats.badges;

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between p-6 border-b border-slate-900 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                    {actualSelectedApplicant.avatar ? (
                      <img 
                        src={actualSelectedApplicant.avatar} 
                        className="w-14 h-14 rounded-full object-cover" 
                        referrerPolicy="no-referrer"
                        alt={actualSelectedApplicant.name} 
                      />
                    ) : (
                      <UserIcon className="w-7 h-7 text-slate-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-white">{actualSelectedApplicant.name}</h2>
                      {modalBadges.includes('Verified Skill') && (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Job Application Status: <Badge variant={getStatusColor(selectedApplicant.application.status)} className="ml-1 scale-90">{selectedApplicant.application.status === 'Hired' || selectedApplicant.application.status === 'Accepted' ? 'Accepted' : selectedApplicant.application.status}</Badge>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedApplicant(null)}
                  className="text-slate-400 hover:text-slate-100 p-1.5 hover:bg-slate-900 rounded-lg transition-colors ms-4"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-none">
                
                {/* Personal Details */}
                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase text-indigo-400 tracking-wider">Personal Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-sm">
                    <div className="flex items-center gap-2 text-slate-200">
                      <UserIcon className="w-4 h-4 text-slate-500" />
                      <span className="font-semibold text-slate-400">Full Name:</span>
                      <span>{actualSelectedApplicant.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span className="font-semibold text-slate-400">Location:</span>
                      <span>{actualSelectedApplicant.location || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-200 col-span-1 md:col-span-2">
                      <Phone className="w-4 h-4 text-slate-500" />
                      <span className="font-semibold text-slate-400">Phone Number:</span>
                      <span>{actualSelectedApplicant.phone || 'Not specified'}</span>
                    </div>
                  </div>
                </section>

                {/* Skills */}
                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase text-indigo-400 tracking-wider">Skills</h4>
                  <div className="flex gap-2 flex-wrap">
                    {actualSelectedApplicant.skills?.map((s: any) => (
                      <Badge 
                        key={s.name} 
                        variant={s.verified ? "secondary" : "outline"} 
                        className={s.verified ? "border-purple-500/30 text-purple-300 py-1.5 px-3 text-sm" : "py-1.5 px-3 text-sm"}
                      >
                        {s.name}
                        {s.verified && <CheckCircle2 className="w-3.5 h-3.5 ml-1.5 text-purple-400" />}
                      </Badge>
                    ))}
                    {(!actualSelectedApplicant.skills || actualSelectedApplicant.skills.length === 0) && (
                      <p className="text-sm text-slate-500 italic">No skills listed.</p>
                    )}
                  </div>
                </section>

                {/* Experience */}
                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase text-indigo-400 tracking-wider">Work Experience</h4>
                  {actualSelectedApplicant.experience?.length > 0 ? (
                    <div className="space-y-3">
                      {actualSelectedApplicant.experience.map((exp: string, index: number) => (
                        <div key={index} className="flex gap-3 p-3.5 rounded-xl bg-slate-900/30 border border-slate-800 text-sm">
                          <Briefcase className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                          <span className="text-slate-300">{exp}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No work experience listed.</p>
                  )}
                </section>

                {/* Education */}
                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase text-indigo-400 tracking-wider">Education & Certifications</h4>
                  <div className="space-y-3">
                    {actualSelectedApplicant.education?.map((edu: string, index: number) => (
                      <div key={`edu-${index}`} className="flex gap-3 p-3.5 rounded-xl bg-slate-900/30 border border-slate-800 text-sm">
                        <GraduationCap className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                        <span className="text-slate-300">{edu}</span>
                      </div>
                    ))}

                    {actualSelectedApplicant.certifications?.map((cert: string, index: number) => (
                      <div key={`cert-${index}`} className="flex gap-3 p-3.5 rounded-xl bg-slate-900/30 border border-slate-800 text-sm border-dashed">
                        <Award className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <span className="text-slate-300 font-medium">{cert}</span>
                      </div>
                    ))}

                    {(!actualSelectedApplicant.education || actualSelectedApplicant.education.length === 0) && (!actualSelectedApplicant.certifications || actualSelectedApplicant.certifications.length === 0) && (
                      <p className="text-sm text-slate-500 italic">No education or certifications listed.</p>
                    )}
                  </div>
                </section>

                {/* Trust Information */}
                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase text-indigo-400 tracking-wider">Trust Information</h4>
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-sm">
                    <div className="text-center p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                      <p className="text-xs text-slate-400">Trust Score</p>
                      <p className="text-xl font-bold text-emerald-400 mt-1">
                        {modalStats.trustScore || 0}%
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                      <p className="text-xs text-slate-400">Average Rating</p>
                      <p className="text-xl font-bold text-slate-200 mt-1 flex items-center justify-center gap-1.5">
                        {modalStats.rating || 0} <Star className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs font-semibold text-slate-400 mb-2">Verification Badges</p>
                      <div className="flex gap-2 flex-wrap">
                        {modalBadges.map((badge: string) => (
                          <Badge key={badge} variant="success" className="gap-1.5 py-1 px-3">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            {badge}
                          </Badge>
                        ))}
                        {modalBadges.length === 0 && (
                          <p className="text-xs text-slate-500 italic">No trust badges earned yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Documents */}
                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase text-indigo-400 tracking-wider">Documents</h4>
                  {(actualSelectedApplicant.resumeUrl || actualSelectedApplicant.id === 's1') ? (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-500/10 text-red-400 rounded-lg">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-200">
                            {actualSelectedApplicant.id === 's1' ? 'Rahul_Sharma_Resume.pdf' : actualSelectedApplicant.resumeUrl}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">PDF Format • Supported Document</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => handleMockDownload(actualSelectedApplicant.id === 's1' ? 'Rahul_Sharma_Resume.pdf' : actualSelectedApplicant.resumeUrl)}
                      >
                        <Download className="w-4 h-4" /> Download
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 text-center rounded-xl border border-dashed border-slate-800 text-sm text-slate-500">
                      No resume uploaded.
                    </div>
                  )}
                </section>

              </div>

              {/* Modal Footer / Quick Decisions */}
              {['Applied', 'Under Review', 'Shortlisted'].includes(selectedApplicant.application.status) && (
                <div className="p-6 border-t border-slate-900 shrink-0 bg-slate-950 rounded-b-2xl flex justify-between gap-3 flex-wrap">
                  <div className="flex gap-2">
                    {selectedApplicant.application.status === 'Applied' && (
                      <Button 
                        variant="outline"
                        className="text-xs font-semibold text-slate-300" 
                        onClick={() => {
                          updateApplicationStatus(selectedApplicant.application.id, 'Under Review');
                          setSelectedApplicant(null);
                        }}
                      >
                        Mark Under Review
                      </Button>
                    )}
                    <Button 
                      className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white" 
                      onClick={() => {
                        updateApplicationStatus(selectedApplicant.application.id, 'Shortlisted');
                        setSelectedApplicant(null);
                      }}
                    >
                      Shortlist Candidate
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white" 
                      onClick={() => {
                        updateApplicationStatus(selectedApplicant.application.id, 'Accepted');
                        setSelectedApplicant(null);
                      }}
                    >
                      Accept Candidate
                    </Button>
                    <Button 
                      variant="danger" 
                      className="text-xs font-semibold" 
                      onClick={() => {
                        updateApplicationStatus(selectedApplicant.application.id, 'Rejected');
                        setSelectedApplicant(null);
                      }}
                    >
                      Reject Candidate
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })()}

    </div>
  );
}
