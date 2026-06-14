import React from 'react';
import { useAppData } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../lib/Card';
import { Badge } from '../lib/Badge';
import { Button } from '../lib/Button';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { PlusCircle } from 'lucide-react';

export function ManageJobs() {
  const { profile } = useAuth();
  const { jobs, applications, deleteJob } = useAppData();
  const navigate = useNavigate();

  if (!profile) return null;

  const myJobs = jobs.filter(j => j.employerId === profile.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Jobs</h1>
          <p className="text-slate-400">View and edit your active job postings.</p>
        </div>
        <Button onClick={() => navigate('/employer/jobs/create')} className="gap-2">
          <PlusCircle className="w-4 h-4" />
          Post New Job
        </Button>
      </div>

      <div className="space-y-4">
        {myJobs.length > 0 ? (
          myJobs.map(job => {
            const apps = applications.filter(a => a.jobId === job.id);
            return (
              <Card key={job.id}>
                <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                   <div className="flex-1">
                     <div className="flex items-center gap-3 mb-1">
                       <h3 className="text-lg font-semibold">{job.title}</h3>
                       <Badge variant={job.status === 'active' ? 'success' : 'outline'}>{job.status}</Badge>
                     </div>
                     <p className="text-sm text-slate-400">
                       {job.location} • {job.employmentType} • {formatCurrency(job.salaryMin)} - {formatCurrency(job.salaryMax)}/{job.salaryType}
                     </p>
                   </div>
                   <div className="flex items-center gap-6">
                     <div className="text-center">
                       <p className="text-2xl font-bold text-indigo-400">{apps.length}</p>
                       <p className="text-xs text-slate-500">Applicants</p>
                     </div>
                     <div className="flex gap-2">
                       <Button variant="outline" size="sm" onClick={() => navigate(`/employer/applications?jobId=${job.id}`)}>View Applications</Button>
                       <Button variant="danger" size="sm" onClick={() => deleteJob(job.id)}>Delete</Button>
                     </div>
                   </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-12 text-slate-500 space-y-4">
            <p>You haven't posted any jobs yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
