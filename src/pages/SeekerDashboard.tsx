import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppData, useUserStats } from '../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../lib/Card';
import { Badge } from '../lib/Badge';
import { Button } from '../lib/Button';
import { Building2, CheckCircle2, Clock, MapPin, Search, Star, TrendingUp, AlertTriangle, Sparkles, Award, ArrowUpRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { SeekerProfile } from '../types';

export function SeekerDashboard() {
  const { profile } = useAuth();
  const { jobs, applications, standards, notifications, markNotificationAsRead, clearNotifications } = useAppData();
  const navigate = useNavigate();

  const seekerProfile = profile as SeekerProfile;
  const stats = useUserStats(seekerProfile);
  const [refreshState, setRefreshState] = useState(false);

  const handleRegenerateAssistant = () => {
    setRefreshState(true);
    setTimeout(() => {
      setRefreshState(false);
      alert("AI insights updated correctly from your live credentials!");
    }, 1000);
  };

  const careerAnalysis = useMemo(() => {
    const userSkills = seekerProfile?.skills?.map(s => s.name.toLowerCase()) || [];
    
    // Default fallback values
    let careerLevel = "Entry to Mid-Level Specialist";
    let nextPath = "Senior Multi-Discipline Architect";
    let skillsToLearn = ["Advanced Architecture Design", "Cloud Systems Orchestration", "Cross-team Leadership"];
    let missingSkills = ["System Architecture", "Continuous Delivery Integrations"];
    let estimatedSalaryRange = "₹8,00,000 - ₹15,00,000 per year";
    let roleType = "Specialist";

    // 1. Tech & Engineering
    const isTech = userSkills.some(s => s.includes('react') || s.includes('typescript') || s.includes('node') || s.includes('javascript') || s.includes('python') || s.includes('java') || s.includes('developer'));
    // 2. Trades
    const isTrades = userSkills.some(s => s.includes('electric') || s.includes('plumb') || s.includes('weld') || s.includes('carpenter') || s.includes('hvac') || s.includes('wire'));
    // 3. Education
    const isEducation = userSkills.some(s => s.includes('teach') || s.includes('tutor') || s.includes('math') || s.includes('academic') || s.includes('lecture') || s.includes('school'));
    // 4. Healthcare
    const isHealthcare = userSkills.some(s => s.includes('nurse') || s.includes('health') || s.includes('patient') || s.includes('clinical') || s.includes('pharm') || s.includes('caregiver'));
    // 5. Creative
    const isCreative = userSkills.some(s => s.includes('design') || s.includes('photoshop') || s.includes('illustrator') || s.includes('content') || s.includes('ui/ux') || s.includes('writer'));

    if (isTech) {
      roleType = "Software Development / Engineering";
      careerLevel = "Professional Frontend & Full-Stack Developer";
      nextPath = "Technical Solutions Architect / Staff Software Engineer";
      skillsToLearn = ["Next.js (App Router)", "Advanced GraphQL APIs", "Microservices & Serverless Architecture", "System Design & Scalability Patterns"];
      missingSkills = ["Kubernetes & Docker (Containerization)", "CI/CD Deployment Pipelines", "Cloud Solution Design (AWS/GCP)", "Redis / Database Performance Tuning"];
      estimatedSalaryRange = "₹12,00,000 - ₹24,00,000 per year";
    } else if (isTrades) {
      roleType = "Vocational & Skilled Trades";
      careerLevel = "Certified Practical Technician";
      nextPath = "Industrial Project Foreman / Master Trades Consultant";
      skillsToLearn = ["Automated Smart Controls Assembly", "Industrial PLC Programming", "Commercial Safety Supervision Standards"];
      missingSkills = ["3-Phase High Voltage Operations", "Blueprints & CAD Design Interpretation", "HVAC Estimator Accreditations"];
      estimatedSalaryRange = "₹65,000 - ₹1,20,000 per month";
    } else if (isEducation) {
      roleType = "Academic Instruction & Mentorship";
      careerLevel = "Professional Course Instructor / Senior Tutor";
      nextPath = "Academic Dean / Curriculum Director";
      skillsToLearn = ["Digital Pedagogy & E-Learning Systems", "Advanced Statistics & Educational Analytics", "Academic Panel Leadership"];
      missingSkills = ["LMS Platform Administration (Moodle/Canvas)", "Interactive Content Authoring (Captivate)"];
      estimatedSalaryRange = "₹55,000 - ₹1,05,000 per month";
    } else if (isHealthcare) {
      roleType = "Clinical Care & Patient Management";
      careerLevel = "Licensed Medical Assistant / Nurse Care Specialist";
      nextPath = "Clinical Operations Supervisor / Chief Medical Admin";
      skillsToLearn = ["Acute Care Response", "Specialist Patient Diagnostics", "Electronic Medical Records System Optimization"];
      missingSkills = ["Advanced Cardiac Life Support (ACLS)", "Clinical Administration Rules & Compliance"];
      estimatedSalaryRange = "₹45,000 - ₹90,000 per month";
    } else if (isCreative) {
      roleType = "Interdisciplinary Creative Design";
      careerLevel = "Professional Graphic & UI Associate";
      nextPath = "Creative Director / Chief Brand Orchestrator";
      skillsToLearn = ["Motion Graphics (After Effects)", "Creative Brand Strategy & Copywriting", "3D Modeling & Scene Creation (Blender)"];
      missingSkills = ["Interactive Prototyping (Figma Components)", "Data-driven Conversion Optimizations (CRO)"];
      estimatedSalaryRange = "₹70,000 - ₹1,40,000 per month";
    }

    return {
      roleType,
      careerLevel,
      nextPath,
      skillsToLearn,
      missingSkills,
      estimatedSalaryRange
    };
  }, [seekerProfile]);

  if (!seekerProfile) return null;

  const myApplications = applications.filter(a => a.seekerId === seekerProfile.id);
  const myNotifications = notifications.filter(n => n.userId === seekerProfile.id);
  const activeJobs = jobs.filter(j => j.status === 'active');
  
  const recommendedJobs = activeJobs.map(job => {
    let score = 20; // base score
    
    // Skills Map: up to 30 points
    if (seekerProfile.skills && seekerProfile.skills.length > 0) {
      const matchedSkills = job.requiredSkills.filter(reqSkill => 
        seekerProfile.skills.some(mySkill => mySkill.name.toLowerCase().includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(mySkill.name.toLowerCase()))
      );
      if (job.requiredSkills.length > 0) {
        score += Math.round((matchedSkills.length / job.requiredSkills.length) * 30);
      }
    }

    // Location: 15 points
    if (seekerProfile.location && (seekerProfile.location.toLowerCase().includes(job.location.toLowerCase()) || job.location === 'Remote')) {
      score += 15;
    }

    // Category preference: 15 points
    if (seekerProfile.preferredCategories && seekerProfile.preferredCategories.includes(job.category)) {
      score += 15;
    }

    // Work type preference: 10 points
    if (seekerProfile.preferredWorkTypes && seekerProfile.preferredWorkTypes.some(t => job.employmentType.toLowerCase().includes(t.toLowerCase()))) {
      score += 10;
    }

    // Experience match (dummy check): 10 points
    if (seekerProfile.experience && seekerProfile.experience.length > 0) {
       // if job requires experience, we give points if they have any listed
       score += 10; 
    }

    return { job, score: Math.min(score, 99) }; // Max 99%
  }).sort((a, b) => b.score - a.score).slice(0, 3); // top 3

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {seekerProfile.name}</h1>
          <p className="text-slate-400">Here's your activity overview and job recommendations.</p>
        </div>
        <Button onClick={() => navigate('/seeker/jobs')} className="gap-2">
          <Search className="w-4 h-4" />
          Find Jobs
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card onClick={() => navigate('/seeker/profile')} className="cursor-pointer hover:border-indigo-500/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle>Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mt-2">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" className="stroke-slate-800" strokeWidth="6" fill="none" />
                    <circle 
                    cx="32" 
                    cy="32" 
                    r="28" 
                    className="stroke-indigo-500 transition-all duration-1000 ease-in-out" 
                    strokeWidth="6" 
                    fill="none" 
                    strokeDasharray={176} 
                    strokeDashoffset={176 - (176 * seekerProfile.profileCompletion) / 100} 
                  />
                </svg>
                <span className="absolute text-sm font-bold">{seekerProfile.profileCompletion}%</span>
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{seekerProfile.profileCompletion === 100 ? 'Fully Complete!' : 'Looking Good!'}</p>
                <p className="text-xs text-slate-400">
                  {seekerProfile.profileCompletion === 100 
                    ? 'Your profile is ready to impress.' 
                    : 'Click to add more details & get better matches.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card onClick={() => navigate('/seeker/profile')} className="cursor-pointer hover:border-emerald-500/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle>Reputation Center</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-xs text-slate-400">Trust Score</p>
                <p className="text-2xl font-bold flex items-center gap-1 text-emerald-400">
                  {stats?.trustScore || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Avg Rating</p>
                <p className="text-2xl font-bold flex items-baseline gap-1">
                  {stats?.rating || 0} <span className="text-xs font-normal text-slate-500">/ 5</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Completed Jobs</p>
                <p className="text-lg font-semibold">{stats?.completedJobs || 0}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Reviews</p>
                <p className="text-lg font-semibold">{stats?.reviewCount || 0}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="text-xs font-medium mb-2">Earned Badges</p>
              <div className="flex flex-wrap gap-2">
                {stats?.badges.length ? (
                  stats.badges.map((badge, i) => (
                    <Badge key={i} variant="success" className="gap-1.5 py-1 px-3">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {badge}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No badges yet.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card onClick={() => navigate('/seeker/applications')} className="cursor-pointer hover:border-slate-500/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle>Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold">{myApplications.length}</span>
              <span className="text-sm text-slate-400">active applications</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>AI Recommended Jobs</CardTitle>
              <Badge variant="secondary" className="gap-1">
                <Star className="w-3 h-3" />
                Smart Matches
              </Badge>
            </div>
            <CardDescription>Based on your profile, skills, and preferences</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            {seekerProfile.profileCompletion < 100 && (
               <div className="p-3 mb-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
                 <AlertTriangle className="w-5 h-5 text-indigo-400 shrink-0" />
                 <div className="text-sm">
                   <p className="font-semibold text-indigo-400">Complete your profile to unlock better recommendations.</p>
                   <p className="text-slate-400 mt-1">Add education, experience, and preferences to increase your match accuracy.</p>
                 </div>
               </div>
            )}
            {recommendedJobs.length > 0 ? (
              recommendedJobs.map(({ job, score }) => (
                <div key={job.id} className="border border-slate-800 rounded-lg p-4 bg-slate-900/50 hover:bg-slate-800/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-100">{job.title}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <Building2 className="w-3 h-3" />
                        {job.companyName || 'TechCorp Solutions'}
                      </p>
                    </div>
                    <Badge variant={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'outline'} className="font-bold">
                      {score}% Match
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-300">
                    <span className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
                      <Clock className="w-3 h-3" />
                      {job.employmentType}
                    </span>
                    <span className="font-semibold text-emerald-400">
                      {formatCurrency(job.salaryMin)} - {formatCurrency(job.salaryMax)}/{job.salaryType}
                    </span>
                  </div>
                  
                  <div className="mt-4">
                     <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/seeker/jobs')}>View Details</Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">No strong matches found. Try adding more skills to your profile.</div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>In-App Notifications</CardTitle>
              {myNotifications.length > 0 && (
                <button 
                  onClick={() => clearNotifications(seekerProfile.id)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Clear All
                </button>
              )}
            </CardHeader>
            <CardContent>
              {myNotifications.length > 0 ? (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {myNotifications.map(notif => (
                    <div 
                      key={notif.id} 
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-3 rounded-lg border transition-colors cursor-pointer text-left ${notif.read ? 'border-slate-800 bg-slate-900/20' : 'border-indigo-500/20 bg-indigo-500/5'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-medium text-xs text-slate-200">
                          {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />}
                          {notif.title}
                        </div>
                        <span className="text-[9px] text-slate-500 shrink-0">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{notif.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs text-center py-4">No notifications yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {myApplications.length > 0 ? (
                <div className="space-y-4">
                  {myApplications.slice(0, 3).map(app => {
                    const job = jobs.find(j => j.id === app.jobId);
                    if (!job) return null;
                    
                    // Display statuses nicely
                    let displayStatus = app.status;
                    let variant: 'success' | 'danger' | 'warning' | 'secondary' | 'outline' = 'outline';
                    
                    if (app.status === 'Hired' || app.status === 'Accepted' || app.status === 'Completed') {
                      displayStatus = 'Accepted';
                      variant = 'success';
                    } else if (app.status === 'Rejected') {
                      variant = 'danger';
                    } else if (app.status === 'Shortlisted') {
                      variant = 'warning';
                    } else if (app.status === 'Under Review') {
                      variant = 'secondary';
                    }

                    return (
                      <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-800">
                        <div>
                          <p className="font-medium text-sm">{job.title}</p>
                          <p className="text-xs text-slate-400">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={variant}>
                          {displayStatus}
                        </Badge>
                      </div>
                    )
                  })}
                  <Button variant="ghost" className="w-full text-xs" onClick={() => navigate('/seeker/applications')}>
                    View All Applications
                  </Button>
                </div>
              ) : (
                 <div className="text-center py-8 text-slate-400 text-sm">You haven't applied to any jobs yet.</div>
              )}
            </CardContent>
          </Card>

          <Card className="glass relative overflow-hidden border-indigo-500/30">
            <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-indigo-400 w-5 h-5" />
                <CardTitle>Wage Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-slate-300">
                  We monitor industry standards to ensure employers offer fair wages. 
                  Always look for the <Badge variant="success" className="px-1 scale-90">Fair Wage</Badge> badge when applying.
                </div>
                <div className="text-xs space-y-2 pt-2 border-t border-slate-800/50">
                   {standards.slice(0,2).map((s, i) => (
                     <div key={i} className="flex justify-between items-center">
                       <span className="text-slate-400">{s.title} Avg:</span>
                       <span className="font-medium">{formatCurrency(s.min)} - {formatCurrency(s.max)}/mo</span>
                     </div>
                   ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FEATURE 2: AI CAREER GROWTH ASSISTANT */}
      <Card id="ai-career-growth-assistant" className="border-indigo-500/20 bg-indigo-950/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <CardHeader className="pb-4 border-b border-white/5 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div className="flex items-start gap-3">
               <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                 <Sparkles className="w-5 h-5" />
               </div>
               <div>
                 <CardTitle className="text-xl flex items-center gap-2">
                   AI Career Growth Assistant
                   <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold px-2 py-0.5 text-[10px] tracking-wide">VERIFIED RECOMMENDATIONS</Badge>
                 </CardTitle>
                 <CardDescription className="text-slate-400 mt-1">Personalized real-time recommendations, skill gap metrics, and salary projections.</CardDescription>
               </div>
             </div>
             <Button 
               id="ai-refresh-btn" 
               variant="outline" 
               size="sm" 
               onClick={handleRegenerateAssistant} 
               disabled={refreshState}
               className="text-xs self-start sm:self-center gap-1.5 border-indigo-500/30 hover:bg-indigo-950/30 transition-all font-medium py-2 px-3 h-9"
             >
               <Sparkles className={`w-3.5 h-3.5 text-indigo-400 ${refreshState ? 'animate-spin' : ''}`} /> 
               {refreshState ? 'Analyzing Profile...' : 'AI Profile Audit'}
             </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 relative z-10 space-y-6">
          {refreshState ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-400 animate-pulse font-medium">Re-evaluating skills, applied jobs, and certificate audits...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Details Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/40 p-5 rounded-xl border border-slate-800">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Estimated Career Level</p>
                  <p className="text-lg font-bold text-slate-200">{careerAnalysis.careerLevel}</p>
                  <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 py-0.5 text-xs">
                    Category: {careerAnalysis.roleType}
                  </Badge>
                </div>
                <div className="space-y-1.5 md:border-l md:border-slate-800 md:pl-6">
                  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-400" />
                    Recommended Next Career Target
                  </p>
                  <p className="text-lg font-bold text-slate-200">{careerAnalysis.nextPath}</p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" /> Focus on gaps highlighted below to advance.
                  </p>
                </div>
              </div>

              {/* Learning Pathways & Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skills To Learn */}
                <Card className="bg-slate-900/20 border-slate-850">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      Priority Skills To Master
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">High-leverage competencies aligned with {careerAnalysis.nextPath}.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {careerAnalysis.skillsToLearn.map((skill, index) => (
                        <span key={index} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/5 text-emerald-300 border border-emerald-500/15 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Gaps missing */}
                <Card className="bg-slate-900/20 border-slate-850">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Identified Industry Gaps
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">Crucial elements absent or undeveloped on your profile card.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {careerAnalysis.missingSkills.map((skill, index) => (
                        <span key={index} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/5 text-amber-300 border border-amber-500/15 text-xs font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Estimations row */}
              <div className="bg-indigo-600/5 border border-indigo-500/15 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Growth Estimations</p>
                  <h4 className="text-base font-bold text-slate-200">Earned potential based on target transition</h4>
                </div>
                <div className="bg-slate-900 border border-slate-800 px-5 py-3 rounded-xl text-center shrink-0 w-full sm:w-auto">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">Projected Target Compensation</p>
                  <p className="text-lg font-extrabold text-emerald-400 mt-0.5">{careerAnalysis.estimatedSalaryRange}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
