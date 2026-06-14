import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppData, useUserStats } from '../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../lib/Card';
import { Badge } from '../lib/Badge';
import { Input } from '../lib/Input';
import { Button } from '../lib/Button';
import { SeekerProfile, Skill } from '../types';
import { CheckCircle2, Award, BookOpen, Briefcase, File, List, Plus, Trash, Pencil, X, Save, FileText, Star, MessageSquare, Download, UploadCloud, AlertCircle } from 'lucide-react';
import { MOCK_USERS } from '../data/mock';

export function SeekerProfilePage() {
  const { profile, updateProfile } = useAuth();
  const { seekerReviews } = useAppData();
  
  const seekerContext = profile as SeekerProfile;
  const [draft, setDraft] = useState<SeekerProfile>(seekerContext);
  const [successMsg, setSuccessMsg] = useState('');

  // Sync once when mounting or user changes
  React.useEffect(() => {
    setDraft(seekerContext);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seekerContext?.id]);

  const [editingBasic, setEditingBasic] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const [newSkill, setNewSkill] = useState('');
  const [newExperience, setNewExperience] = useState('');
  const [newEducation, setNewEducation] = useState('');

  const stats = useUserStats(profile);

  if (!profile || profile.role !== 'seeker') return null;
  const seeker = draft;

  const usersStr = localStorage.getItem('worksphere_users');
  const allUsers: (any)[] = usersStr ? JSON.parse(usersStr) : MOCK_USERS;

  const myReviews = seekerReviews.filter(r => r.seekerId === seeker.id);

  const calcScore = (data: Partial<SeekerProfile>) => {
    let score = 20;
    if (data.skills && data.skills.length > 0) score += 15;
    if (data.experience && data.experience.length > 0) score += 15;
    if (data.education && data.education.length > 0) score += 15;
    if (data.resumeUrl) score += 15;
    if ((data.certifications && data.certifications.length > 0) || data.hasNoCertifications) score += 10;
    if (data.preferredWorkTypes && data.preferredWorkTypes.length > 0) score += 10;
    return Math.min(score, 100);
  };

  const currentScore = calcScore(draft);

  const handleUpdateDraft = (updates: Partial<SeekerProfile>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  };

  const handleSaveProfile = () => {
    updateProfile(draft);
    setSuccessMsg('Profile Saved Successfully');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveBasic = () => {
    handleUpdateDraft({ name: editName, location: editLocation, phone: editPhone });
    setEditingBasic(false);
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    handleUpdateDraft({ skills: [...seeker.skills, { name: newSkill.trim(), verified: false }] });
    setNewSkill('');
  };

  const handleRemoveSkill = (index: number) => {
    const updated = [...seeker.skills];
    updated.splice(index, 1);
    handleUpdateDraft({ skills: updated });
  };

  const handleAddExperience = () => {
    if (!newExperience.trim()) return;
    handleUpdateDraft({ experience: [...seeker.experience, newExperience.trim()] });
    setNewExperience('');
  };

  const handleRemoveExperience = (index: number) => {
    const updated = [...seeker.experience];
    updated.splice(index, 1);
    handleUpdateDraft({ experience: updated });
  };

  const handleAddEducation = () => {
    if (!newEducation.trim()) return;
    handleUpdateDraft({ education: [...seeker.education, newEducation.trim()] });
    setNewEducation('');
  };

  const handleRemoveEducation = (index: number) => {
    const updated = [...seeker.education];
    updated.splice(index, 1);
    handleUpdateDraft({ education: updated });
  };

  const handleRemoveCertification = (index: number) => {
    const updated = [...(seeker.certifications || [])];
    updated.splice(index, 1);
    handleUpdateDraft({ certifications: updated });
  };

  const handleCategoriesChange = (cat: string) => {
    const current = seeker.preferredCategories || [];
    if (current.includes(cat)) {
      handleUpdateDraft({ preferredCategories: current.filter(c => c !== cat) });
    } else {
      handleUpdateDraft({ preferredCategories: [...current, cat] });
    }
  };

  const handleWorkTypeChange = (type: string) => {
    const current = seeker.preferredWorkTypes || [];
    if (current.includes(type)) {
      handleUpdateDraft({ preferredWorkTypes: current.filter(c => c !== type) });
    } else {
      handleUpdateDraft({ preferredWorkTypes: [...current, type] });
    }
  };

  const CATEGORIES = ['IT', 'Trades', 'Education', 'Transport', 'Healthcare'];
  const WORK_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Remote', 'Hybrid'];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-slate-400">Manage your skills and verification status.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold uppercase text-indigo-400">Completion Score</p>
            <p className="text-3xl font-bold">{currentScore}%</p>
          </div>
          <Button onClick={handleSaveProfile} className="flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Profile
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium flex items-center justify-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="md:col-span-1">
           <CardContent className="p-6 text-center">
             <div className="w-24 h-24 rounded-full match-gradient mx-auto flex items-center justify-center text-3xl font-bold text-white mb-4">
               {seeker.name.charAt(0)}
             </div>
             
             {editingBasic ? (
               <div className="space-y-3 mb-4 text-left">
                 <Input label="Name" value={editName} onChange={e => setEditName(e.target.value)} />
                 <Input label="Location" value={editLocation} onChange={e => setEditLocation(e.target.value)} />
                 <Input label="Phone Number" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                 <div className="flex gap-2">
                   <Button size="sm" onClick={handleSaveBasic} className="flex-1"><Save className="w-4 h-4 mr-1"/> Save</Button>
                   <Button size="sm" variant="outline" onClick={() => setEditingBasic(false)}><X className="w-4 h-4"/></Button>
                 </div>
               </div>
             ) : (
               <div className="mb-4">
                 <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                   {seeker.name}
                   <button onClick={() => { setEditName(seeker.name); setEditLocation(seeker.location); setEditPhone(seeker.phone || ''); setEditingBasic(true); }} className="text-slate-400 hover:text-indigo-400"><Pencil className="w-4 h-4"/></button>
                 </h2>
                 <p className="text-sm text-slate-400">{seeker.location || 'Add your location'}</p>
                 <p className="text-sm text-slate-400 mt-1">{seeker.phone || 'Add phone number'}</p>
                 <div className="flex justify-center mt-2 items-center gap-1.5 text-amber-400 font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{stats?.rating || '0.0'}</span>
                    <span className="text-xs text-slate-500 font-normal">({stats?.reviewCount || 0} reviews)</span>
                 </div>
                 <div className="mt-1">
                    <p className="text-xs text-slate-500">Trust Score: <span className="font-bold text-emerald-400">{stats?.trustScore}/100</span></p>
                 </div>
               </div>
             )}

             <div className="space-y-3 mt-4 pt-4 border-t border-slate-800">
               <h4 className="text-sm font-semibold text-slate-300 text-left mb-2">Trust Badges</h4>
               {stats?.badges && stats.badges.length > 0 ? stats.badges.map(badge => (
                 <div key={badge} className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 p-2 rounded-md border border-emerald-500/20">
                   <CheckCircle2 className="w-4 h-4" />
                   <span className="font-medium">{badge}</span>
                 </div>
               )) : (
                 <p className="text-sm text-slate-500 mt-2">No badges yet.</p>
               )}
             </div>
           </CardContent>
         </Card>

         <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" /> Reviews & Ratings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                 {myReviews.length > 0 ? (
                    <div className="space-y-4">
                       {myReviews.map(review => {
                          const emp = allUsers.find(u => u.id === review.employerId);
                          return (
                            <div key={review.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                               <div className="flex justify-between items-start mb-2">
                                  <div>
                                     <p className="font-semibold text-slate-200">{emp?.name || 'Employer'}</p>
                                     <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                                  </div>
                                  <div className="flex gap-1">
                                     {[1,2,3,4,5].map(star => (
                                       <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                                     ))}
                                  </div>
                               </div>
                               <p className="text-sm text-slate-300 mt-3 flex items-start gap-2">
                                  <MessageSquare className="w-4 h-4 text-slate-500 shrink-0 mt-0.5"/>
                                  {review.comment}
                               </p>
                            </div>
                          )
                       })}
                    </div>
                 ) : (
                    <p className="text-sm text-slate-500 text-center py-4">You have no reviews yet. Complete jobs to earn ratings.</p>
                 )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" /> Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {seeker.skills.map((skill, i) => (
                    <Badge key={i} variant={skill.verified ? 'secondary' : 'outline'} className="px-3 py-1 text-sm flex items-center gap-1">
                      {skill.name} 
                      {skill.verified && <CheckCircle2 className="w-3.5 h-3.5 ml-1 text-purple-400" />}
                      <button onClick={() => handleRemoveSkill(i)} className="ml-1 text-slate-500 hover:text-red-400"><X className="w-3 h-3"/></button>
                    </Badge>
                  ))}
                  {seeker.skills.length === 0 && <span className="text-slate-500 text-sm">No skills added yet.</span>}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Add a skill (e.g. React)" value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddSkill()} />
                  <Button onClick={handleAddSkill}><Plus className="w-4 h-4"/></Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-400" /> Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-4 mb-4">
                  {seeker.experience.map((exp, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start justify-between gap-3 group">
                      <div className="flex items-start gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5"></div>
                         {exp}
                      </div>
                      <button onClick={() => handleRemoveExperience(i)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity"><Trash className="w-4 h-4"/></button>
                    </li>
                  ))}
                  {seeker.experience.length === 0 && <span className="text-slate-500 text-sm">No experience added yet.</span>}
                </ul>
                <div className="flex gap-2">
                  <Input placeholder="Add experience (e.g. Frontend Developer at TechCorp)" value={newExperience} onChange={e => setNewExperience(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddExperience()} />
                  <Button onClick={handleAddExperience}><Plus className="w-4 h-4"/></Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="flex items-center gap-2">
                   <BookOpen className="w-5 h-5 text-amber-400" /> Education
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-4 mb-4">
                  {seeker.education.map((edu, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start justify-between gap-3 group">
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5"></div>
                        {edu}
                      </div>
                      <button onClick={() => handleRemoveEducation(i)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity"><Trash className="w-4 h-4"/></button>
                    </li>
                  ))}
                  {seeker.education.length === 0 && <span className="text-slate-500 text-sm">No education added yet.</span>}
                </ul>
                <div className="flex gap-2">
                  <Input placeholder="Add education (e.g. B.Tech Computer Science)" value={newEducation} onChange={e => setNewEducation(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddEducation()} />
                  <Button onClick={handleAddEducation}><Plus className="w-4 h-4"/></Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="flex items-center gap-2">
                   <Award className="w-5 h-5 text-emerald-400" /> Certifications (Verified Badges)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <CertificationUploadManager seeker={seeker} updateProfile={handleUpdateDraft} handleRemoveCertification={handleRemoveCertification} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="flex items-center gap-2">
                   <FileText className="w-5 h-5 text-blue-400" /> Resume Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResumeUploadManager seeker={seeker} updateProfile={handleUpdateDraft} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="flex items-center gap-2">
                   <List className="w-5 h-5 text-pink-400" /> Job Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Preferred Categories</h4>
                  <div className="flex flex-wrap gap-2">
                     {CATEGORIES.map(cat => {
                       const active = (seeker.preferredCategories || []).includes(cat);
                       return (
                         <div 
                           key={cat} 
                           onClick={() => handleCategoriesChange(cat)}
                           className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors border ${active ? 'bg-indigo-600/20 text-indigo-400 border-indigo-600/30' : 'bg-transparent text-slate-400 border-white/10 hover:border-slate-500'}`}
                         >
                           {cat}
                         </div>
                       )
                     })}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3">Preferred Work Type</h4>
                  <div className="flex flex-wrap gap-2">
                     {WORK_TYPES.map(type => {
                       const active = (seeker.preferredWorkTypes || []).includes(type);
                       return (
                         <div 
                           key={type} 
                           onClick={() => handleWorkTypeChange(type)}
                           className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors border ${active ? 'bg-indigo-600/20 text-indigo-400 border-indigo-600/30' : 'bg-transparent text-slate-400 border-white/10 hover:border-slate-500'}`}
                         >
                           {type}
                         </div>
                       )
                     })}
                  </div>
                </div>
              </CardContent>
            </Card>
         </div>
      </div>
    </div>
  )
}

function parseFileMetadata(data?: string) {
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    if (parsed.name) return parsed;
  } catch (e) {
    // legacy mock or plain string
  }
  return { name: data, type: 'application/pdf', size: 0, uploadedAt: new Date().toISOString() };
}

function handleMockDownload(name: string, type: string) {
  const blob = new Blob([`Mock file content for ${name}`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function ResumeUploadManager({ seeker, updateProfile }: any) {
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  
  const resume = parseFileMetadata(seeker.resumeUrl);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    e.target.value = '';

    // validate
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
      setError('Unsupported file type. Please upload PDF, DOC, or DOCX.');
      return;
    }

    const metadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    };
    
    updateProfile({ resumeUrl: JSON.stringify(metadata) });
    setSuccessMsg('Resume uploaded successfully.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}
      
      {resume ? (
        <div className="flex flex-col gap-4 p-4 bg-slate-900/50 rounded-xl border border-white/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <File className="w-8 h-8 text-blue-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-200 truncate max-w-[200px] md:max-w-xs">{resume.name}</p>
                <p className="text-xs text-slate-500">
                  {resume.size > 0 ? `${(resume.size / 1024 / 1024).toFixed(2)} MB` : 'Ready for employer review'} &bull; {new Date(resume.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Button size="sm" variant="secondary" className="flex items-center gap-1.5" onClick={() => handleMockDownload(resume.name, resume.type)}>
                <Download className="w-4 h-4" /> View / Download
              </Button>
              <div className="relative">
                <input title="Replace" type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" className="absolute inset-0 opacity-0 cursor-pointer" />
                <Button size="sm" variant="outline" className="flex items-center gap-1.5 w-full pointer-events-none">
                  <UploadCloud className="w-4 h-4" /> Replace
                </Button>
              </div>
              <Button size="sm" variant="danger" className="flex items-center gap-1.5" onClick={() => updateProfile({ resumeUrl: undefined })}>
                <Trash className="w-4 h-4" /> Delete
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative text-center p-8 border border-dashed border-white/20 rounded-xl hover:border-blue-400/50 transition-colors bg-slate-900/30">
          <input title="Upload Resume" type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <UploadCloud className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300 mb-1">Click or drag file to upload resume</p>
          <p className="text-xs text-slate-500">PDF, DOC, DOCX up to 10MB</p>
          <Button className="mt-4 pointer-events-none">Select File</Button>
        </div>
      )}
    </div>
  );
}

function CertificationUploadManager({ seeker, updateProfile, handleRemoveCertification }: any) {
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext || '')) {
      setError('Unsupported file type. Please upload PDF, JPG, or PNG.');
      return;
    }

    const metadata = {
      name: file.name,
      fileName: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      status: 'Verified'
    };
    
    updateProfile({ certifications: [...(seeker.certifications || []), JSON.stringify(metadata)] });
    setSuccessMsg('Certification uploaded successfully.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}

      {seeker.hasNoCertifications ? (
        <p className="text-sm text-slate-400 italic py-4">No Certifications Added</p>
      ) : (
        <>
          {(!seeker.certifications || seeker.certifications.length === 0) && (
            <span className="text-slate-500 text-sm block mb-4">Upload certifications to earn Verified Badges.</span>
          )}

          <ul className="space-y-3 mb-4">
            {(seeker.certifications || []).map((cert: string, i: number) => {
               let parsed: any;
               try { 
                 parsed = JSON.parse(cert); 
                 if (!parsed.name) parsed = { name: cert, status: 'Verified' };
               } catch { 
                 parsed = { name: cert, status: 'Verified' }; 
               }

               return (
                 <li key={i} className="text-sm text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-white/5 bg-slate-900/50">
                   <div className="flex items-start gap-3">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                     <div>
                       <p className="font-semibold break-all">{parsed.name}</p>
                       {parsed.uploadedAt && (
                         <p className="text-xs text-slate-500 mt-0.5">
                           Uploaded: {new Date(parsed.uploadedAt).toLocaleDateString()}
                           {parsed.size ? ` • ${(parsed.size / 1024 / 1024).toFixed(2)} MB` : ''}
                         </p>
                       )}
                       <Badge variant="success" className="mt-1.5 py-0.5 px-2 text-[10px] gap-1 inline-flex items-center">
                         <CheckCircle2 className="w-3 h-3" /> {parsed.status}
                       </Badge>
                     </div>
                   </div>
                   <div className="flex gap-2 self-end sm:self-center shrink-0">
                     {parsed.uploadedAt && (
                       <Button size="sm" variant="secondary" onClick={() => handleMockDownload(parsed.fileName || parsed.name, parsed.type || 'application/pdf')}>
                         <Download className="w-3.5 h-3.5" />
                       </Button>
                     )}
                     <Button size="sm" variant="danger" onClick={() => handleRemoveCertification(i)}>
                       <Trash className="w-3.5 h-3.5" />
                     </Button>
                   </div>
                 </li>
               )
            })}
          </ul>
          
          <div className="relative inline-block mt-2">
            <input title="Upload Certification" type="file" onChange={handleFileChange} accept=".pdf,.jpeg,.jpg,.png" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <Button variant="outline" className="flex items-center gap-2 pointer-events-none">
              <UploadCloud className="w-4 h-4" /> Upload Certification
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">Accepted formats: PDF, JPG, PNG (Max 5MB)</p>
        </>
      )}

      <label className="flex items-center gap-2 cursor-pointer mt-6 pt-4 border-t border-slate-800">
        <input 
          type="checkbox" 
          className="w-4 h-4 rounded border-white/10 bg-slate-900/50 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900" 
          checked={!!seeker.hasNoCertifications}
          onChange={(e) => updateProfile({ hasNoCertifications: e.target.checked })} 
        />
        <span className="text-sm font-medium text-slate-300">I Do Not Have Certifications</span>
      </label>
    </div>
  )
}
