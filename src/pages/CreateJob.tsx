import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../lib/Card';
import { Input } from '../lib/Input';
import { Button } from '../lib/Button';
import { Badge } from '../lib/Badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CreateJob() {
  const { profile } = useAuth();
  const { addJob, getJobStandard } = useAppData();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'IT',
    location: '',
    salaryMin: '',
    salaryMax: '',
    salaryType: 'month' as 'hour' | 'day' | 'month' | 'year',
    employmentType: 'Full-time' as any,
    requiredSkills: '',
    experienceRequired: '',
    description: ''
  });

  const standard = getJobStandard(formData.category);
  
  let wageWarning = null;
  if (standard && formData.salaryMin && formData.salaryMax && formData.salaryType === standard.type) {
    const min = Number(formData.salaryMin);
    const max = Number(formData.salaryMax);
    if (max < standard.min) {
      wageWarning = { type: 'below', message: `Below market standard! Recommended minimum is ${standard.min}/${standard.type}. This will negatively affect your job visibility.` };
    } else if (min >= standard.max) {
      wageWarning = { type: 'above', message: `Excellent! You are offering above market standard. Your job will receive the "High Paying" badge.` };
    } else {
      wageWarning = { type: 'fair', message: `Within fair market wage standards.` };
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    addJob({
      employerId: profile.id,
      title: formData.title,
      category: formData.category,
      location: formData.location,
      salaryMin: Number(formData.salaryMin),
      salaryMax: Number(formData.salaryMax),
      salaryType: formData.salaryType,
      employmentType: formData.employmentType,
      requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      experienceRequired: formData.experienceRequired,
      description: formData.description
    });
    
    navigate('/employer/dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Post a New Job</h1>
        <p className="text-slate-400">Fill in the details below to publish an opportunity on WorkSphere.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>Be as specific as possible to attract the best matches.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input 
                 label="Job Title" 
                 required 
                 value={formData.title} 
                 onChange={e => setFormData({...formData, title: e.target.value})} 
               />
               <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1.5">Category</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="IT">IT & Software</option>
                    <option value="Trades">Skilled Trades</option>
                    <option value="Education">Education</option>
                    <option value="Transport">Transportation & Delivery</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input 
                 label="Location" 
                 placeholder="e.g. Mumbai, MH or Remote" 
                 required 
                 value={formData.location} 
                 onChange={e => setFormData({...formData, location: e.target.value})}
               />
               <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1.5">Employment Type</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.employmentType}
                    onChange={e => setFormData({...formData, employmentType: e.target.value as any})}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
               </div>
            </div>

            <div className="space-y-4 border-t border-slate-800 pt-6 mt-6">
               <h3 className="text-md font-semibold">Compensation (Fair Wage System)</h3>
               
               <div className="grid grid-cols-3 gap-4 border border-slate-800 p-4 rounded-lg bg-slate-900/50">
                 <Input 
                   type="number" 
                   label="Min Salary (₹)" 
                   required
                   value={formData.salaryMin} 
                   onChange={e => setFormData({...formData, salaryMin: e.target.value})} 
                 />
                 <Input 
                   type="number" 
                   label="Max Salary (₹)" 
                   required
                   value={formData.salaryMax} 
                   onChange={e => setFormData({...formData, salaryMax: e.target.value})} 
                 />
                 <div>
                    <label className="text-sm font-medium text-slate-300 block mb-1.5">Per</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-white/10 glass bg-slate-900/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.salaryType}
                      onChange={e => setFormData({...formData, salaryType: e.target.value as any})}
                    >
                      <option value="hour">Hour</option>
                      <option value="day">Day</option>
                      <option value="month">Month</option>
                      <option value="year">Year</option>
                    </select>
                 </div>
               </div>

               {wageWarning && (
                 <div className={`p-3 rounded-md flex items-start gap-3 border ${
                   wageWarning.type === 'below' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                   wageWarning.type === 'above' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                   'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                 }`}>
                   {wageWarning.type === 'below' ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
                   <p className="text-sm font-medium">{wageWarning.message}</p>
                 </div>
               )}
            </div>

            <div className="space-y-4 border-t border-slate-800 pt-6 mt-6">
              <Input 
                label="Required Skills (comma separated)" 
                placeholder="e.g. React, Node.js, TypeScript"
                required
                value={formData.requiredSkills} 
                onChange={e => setFormData({...formData, requiredSkills: e.target.value})} 
              />
              <Input 
                label="Required Experience" 
                placeholder="e.g. 2-4 years"
                required
                value={formData.experienceRequired} 
                onChange={e => setFormData({...formData, experienceRequired: e.target.value})} 
              />
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1.5">Job Description</label>
                <textarea 
                   className="flex min-h-[120px] w-full rounded-md border border-white/10 glass bg-slate-900/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                   required
                   value={formData.description}
                   onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
               <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
               <Button type="submit">Publish Job</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
