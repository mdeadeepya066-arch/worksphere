import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Application, EscrowTransaction, Job, EmployerReview, SeekerReview, StandardWage, SeekerProfile, EmployerProfile, AppNotification, SavedJob } from '../types';
import { MOCK_APPLICATIONS, MOCK_ESCROWS, MOCK_JOBS, MOCK_EMPLOYER_REVIEWS, MOCK_SEEKER_REVIEWS, MOCK_STANDARDS, MOCK_USERS } from '../data/mock';

interface AppContextType {
  jobs: Job[];
  applications: Application[];
  standards: StandardWage[];
  employerReviews: EmployerReview[];
  seekerReviews: SeekerReview[];
  escrows: EscrowTransaction[];
  notifications: AppNotification[];
  savedJobs: SavedJob[];
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'status' | 'employerName' | 'companyName'> & { employerName?: string; companyName?: string }) => void;
  deleteJob: (jobId: string) => void;
  updateApplicationStatus: (appId: string, status: Application['status']) => void;
  applyForJob: (jobId: string, seekerId: string, matchScore: number) => void;
  getJobStandard: (category: string) => StandardWage | undefined;
  addEmployerReview: (review: Omit<EmployerReview, 'id' | 'createdAt'>) => void;
  addSeekerReview: (review: Omit<SeekerReview, 'id' | 'createdAt'>) => void;
  addNotification: (userId: string, title: string, message: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearNotifications: (userId: string) => void;
  toggleSaveJob: (userId: string, jobId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('worksphere_jobs');
    const usersStr = localStorage.getItem('worksphere_users');
    let registeredEmployerIds: string[] = [];

    if (usersStr) {
      try {
        const users = JSON.parse(usersStr);
        users.forEach((u: any) => {
          if (u.role === 'employer' && u.id !== 'e1' && !registeredEmployerIds.includes(u.id)) {
            registeredEmployerIds.push(u.id);
          }
        });
      } catch (e) {
        console.error("Error parsing worksphere_users", e);
      }
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Job[];
        // STRICT FILTER:
        // 1. employerId is not missing and is not 'e1' (demo employer)
        // 2. employer account exists in worksphere_users (registeredEmployerIds)
        // 3. job was created through Employer Post Job flow (isPostJobFlow === true)
        // 4. job source is not demo/sample/mock (no mock job ID formats)
        return parsed.filter(j => 
          j.employerId && 
          j.employerId !== 'e1' &&
          registeredEmployerIds.includes(j.employerId) &&
          j.isPostJobFlow === true &&
          !j.id.startsWith('j_') &&
          j.id !== 'j1' && j.id !== 'j2' && j.id !== 'j3'
        );
      } catch (e) {
        console.error("Error parsing worksphere_jobs", e);
        return [];
      }
    }
    return [];
  });
  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem('worksphere_applications');
    return saved ? JSON.parse(saved) : MOCK_APPLICATIONS;
  });
  const [standards] = useState<StandardWage[]>(MOCK_STANDARDS);
  const [employerReviews, setEmployerReviews] = useState<EmployerReview[]>(() => {
    const saved = localStorage.getItem('worksphere_employerReviews');
    return saved ? JSON.parse(saved) : MOCK_EMPLOYER_REVIEWS;
  });
  const [seekerReviews, setSeekerReviews] = useState<SeekerReview[]>(() => {
    const saved = localStorage.getItem('worksphere_seekerReviews');
    return saved ? JSON.parse(saved) : MOCK_SEEKER_REVIEWS;
  });
  const [escrows, setEscrows] = useState<EscrowTransaction[]>(() => {
    const saved = localStorage.getItem('worksphere_escrows');
    return saved ? JSON.parse(saved) : MOCK_ESCROWS;
  });
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('worksphere_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>(() => {
    const saved = localStorage.getItem('worksphere_saved_jobs');
    return saved ? JSON.parse(saved) : [];
  });

  // Keep localStorage synchronised with actual state
  useEffect(() => {
    localStorage.setItem('worksphere_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('worksphere_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('worksphere_employerReviews', JSON.stringify(employerReviews));
  }, [employerReviews]);

  useEffect(() => {
    localStorage.setItem('worksphere_seekerReviews', JSON.stringify(seekerReviews));
  }, [seekerReviews]);

  useEffect(() => {
    localStorage.setItem('worksphere_escrows', JSON.stringify(escrows));
  }, [escrows]);

  useEffect(() => {
    localStorage.setItem('worksphere_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('worksphere_saved_jobs', JSON.stringify(savedJobs));
  }, [savedJobs]);

  const toggleSaveJob = (userId: string, jobId: string) => {
    setSavedJobs(prev => {
      const exists = prev.find(item => item.userId === userId && item.jobId === jobId);
      if (exists) {
        return prev.filter(item => !(item.userId === userId && item.jobId === jobId));
      } else {
        const newItem: SavedJob = {
          id: Math.random().toString(36).substring(2, 11),
          userId,
          jobId,
          savedAt: new Date().toISOString()
        };
        return [...prev, newItem];
      }
    });
  };

  const addJob = (newJobData: Omit<Job, 'id' | 'createdAt' | 'status' | 'employerName' | 'companyName'> & { employerName?: string; companyName?: string }) => {
    const usersStr = localStorage.getItem('worksphere_users');
    let employerName = newJobData.employerName || '';
    let companyName = newJobData.companyName || '';

    if (!employerName || !companyName) {
      if (usersStr) {
        try {
          const users = JSON.parse(usersStr);
          const emp = users.find((u: any) => u.id === newJobData.employerId && u.role === 'employer');
          if (emp) {
            employerName = emp.name;
            companyName = emp.companyName || emp.name;
          }
        } catch (e) {
          console.error("Error looking up employer in addJob", e);
        }
      }
      
      // Secondary fallback if still not found
      if (!employerName || !companyName) {
        const emp = MOCK_USERS.find((u: any) => u.id === newJobData.employerId && u.role === 'employer') as EmployerProfile | undefined;
        if (emp) {
          employerName = employerName || emp.name;
          companyName = companyName || emp.companyName || emp.name;
        } else {
          employerName = employerName || 'Jane Doe';
          companyName = companyName || 'TechCorp Solutions';
        }
      }
    }

    const job: Job = {
      ...newJobData,
      id: Math.random().toString(36).substring(2, 11),
      employerName,
      companyName,
      createdAt: new Date().toISOString(),
      status: 'active',
      isPostJobFlow: true
    };
    setJobs(prev => [job, ...prev]);
  };

  const deleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
  };

  const addNotification = (userId: string, title: string, message: string) => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      title,
      message,
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  };

  const clearNotifications = (userId: string) => {
    setNotifications(prev => prev.filter(n => n.userId !== userId));
  };

  const updateApplicationStatus = (appId: string, status: Application['status']) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    // Update statuses
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));

    // Handle Escrow creation for Hired or Accepted
    if (status === 'Hired' || status === 'Accepted') {
      setEscrows(prevEscrows => {
        const escrowExists = prevEscrows.some(e => e.applicationId === appId);
        if (!escrowExists) {
          const newEscrow: EscrowTransaction = {
            id: Math.random().toString(36).substr(2, 9),
            applicationId: appId,
            amount: 0,
            status: 'Pending',
            createdAt: new Date().toISOString()
          };
          return [...prevEscrows, newEscrow];
        }
        return prevEscrows;
      });
    }

    // Trigger Notification
    const job = jobs.find(j => j.id === app.jobId);
    const jobTitle = job ? job.title : 'Web Developer';
    
    let notifTitle = '';
    let notifMessage = '';
    
    if (status === 'Shortlisted') {
      notifTitle = 'Application Shortlisted';
      notifMessage = `Your application for ${jobTitle} has been shortlisted.`;
    } else if (status === 'Accepted' || status === 'Hired') {
      notifTitle = 'Application Accepted';
      notifMessage = `Congratulations! Your application for ${jobTitle} has been accepted.`;
    } else if (status === 'Rejected') {
      notifTitle = 'Application Not Selected';
      notifMessage = `Your application for ${jobTitle} was not selected.`;
    }

    if (notifTitle && notifMessage) {
      const newNotif: AppNotification = {
        id: Math.random().toString(36).substr(2, 9),
        userId: app.seekerId,
        title: notifTitle,
        message: notifMessage,
        createdAt: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const applyForJob = (jobId: string, seekerId: string, matchScore: number) => {
    const exists = applications.find(a => a.jobId === jobId && a.seekerId === seekerId);
    if (!exists) {
      const newApp: Application = {
        id: Math.random().toString(36).substr(2, 9),
        jobId,
        seekerId,
        matchScore,
        status: 'Applied',
        appliedAt: new Date().toISOString(),
      };
      setApplications(prev => [newApp, ...prev]);
    }
  };

  const getJobStandard = (category: string) => {
    return standards.find(s => category.toLowerCase().includes(s.category.toLowerCase()) || category.toLowerCase().includes(s.title.toLowerCase()));
  };

  const addEmployerReview = (review: Omit<EmployerReview, 'id' | 'createdAt'>) => {
    const newReview: EmployerReview = {
      ...review,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setEmployerReviews(prev => {
      const updatedReviews = [newReview, ...prev];
      
      // Keep worksphere_users in localStorage updated with new rating/reviewCount
      const empReviews = updatedReviews.filter(r => r.employerId === review.employerId);
      const count = empReviews.length;
      const avgRating = count > 0 ? empReviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
      
      const usersStr = localStorage.getItem('worksphere_users');
      if (usersStr) {
        try {
          const users = JSON.parse(usersStr);
          const empIndex = users.findIndex((u: any) => u.id === review.employerId);
          if (empIndex !== -1) {
            users[empIndex].rating = Number(avgRating.toFixed(1));
            users[empIndex].reviewCount = count;
            localStorage.setItem('worksphere_users', JSON.stringify(users));
          }
        } catch (e) {
          console.error("Error updating worksphere_users in localStorage", e);
        }
      }
      
      return updatedReviews;
    });
  };

  const addSeekerReview = (review: Omit<SeekerReview, 'id' | 'createdAt'>) => {
    const newReview: SeekerReview = {
      ...review,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setSeekerReviews(prev => [newReview, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      jobs,
      applications,
      standards,
      employerReviews,
      seekerReviews,
      escrows,
      notifications,
      savedJobs,
      addJob,
      deleteJob,
      updateApplicationStatus,
      applyForJob,
      getJobStandard,
      addEmployerReview,
      addSeekerReview,
      addNotification,
      markNotificationAsRead,
      clearNotifications,
      toggleSaveJob
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}

export function useUserStats(profile: SeekerProfile | EmployerProfile | null) {
  const { applications, employerReviews, seekerReviews, jobs, escrows } = useAppData();

  return useMemo(() => {
    if (!profile) return null;

    if (profile.role === 'seeker') {
      const myReviews = seekerReviews.filter(r => r.seekerId === profile.id);
      const myApps = applications.filter(a => a.seekerId === profile.id && a.status === 'Completed');
      
      const reviewCount = myReviews.length;
      const rating = reviewCount > 0 ? myReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;
      const completedJobs = myApps.length + (profile.completedJobs || 0);

      let avgPunctuality = 0;
      if (reviewCount > 0) {
        avgPunctuality = myReviews.reduce((sum, r) => sum + r.categories.punctuality, 0) / reviewCount;
      }

      // Calculate Trust Score (0-100)
      let score = 0;
      score += rating * 8; // Max 40
      score += Math.min(completedJobs * 4, 20); // Max 20
      score += Math.min((profile.certifications?.length || 0) * 5, 10); // Max 10
      score += (profile.profileCompletion / 100) * 15; // Max 15
      // Badges score added later
      
      const newBadges = new Set<string>(profile.trustBadges || []);
      
      if (profile.certifications && profile.certifications.length > 0) newBadges.add('Verified Skill');
      if (profile.profileCompletion === 100) newBadges.add('Profile Complete');
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
    } else {
      const myReviews = employerReviews.filter(r => r.employerId === profile.id);
      const empJobs = jobs.filter(j => j.employerId === profile.id);
      const empJobIds = empJobs.map(j => j.id);
      const empApps = applications.filter(a => empJobIds.includes(a.jobId));
      
      const completedJobs = empApps.filter(a => a.status === 'Completed').length;
      const hiredCount = empApps.filter(a => a.status === 'Hired' || a.status === 'Accepted' || a.status === 'Completed').length;

      const reviewCount = myReviews.length;
      const rating = reviewCount > 0 ? myReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : (profile.rating || 0);
      const totalReviewCount = Math.max(reviewCount, profile.reviewCount || 0);

      // Trust Score Calculation (0-100)
      const ratingPoints = rating * 8; // Max 40
      const completedJobsPoints = Math.min(completedJobs * 5, 20); // Max 20
      const hiredCountPoints = Math.min(hiredCount * 3, 15); // Max 15
      
      const positiveReviews = myReviews.filter(r => r.rating >= 4).length;
      const positivePct = reviewCount > 0 ? (positiveReviews / reviewCount) * 100 : 100;
      const reviewQualityPoints = (positivePct / 100) * 15; // Max 15
      
      const empEscrows = escrows.filter(e => {
        const app = applications.find(a => a.id === e.applicationId);
        return app && empJobIds.includes(app.jobId);
      });
      const paymentCompletionRate = empEscrows.length > 0 
        ? empEscrows.filter(e => e.status === 'Completed' || e.status === 'Released').length / empEscrows.length 
        : 1.0;
      const paymentHistoryPoints = paymentCompletionRate * 10; // Max 10

      const trustScore = Math.min(Math.round(ratingPoints + completedJobsPoints + hiredCountPoints + reviewQualityPoints + paymentHistoryPoints), 100);

      return {
        rating: Number(rating.toFixed(1)),
        reviewCount: totalReviewCount,
        completedJobs,
        hiredCount,
        positivePct: Math.round(positivePct),
        trustScore
      };
    }
  }, [profile, applications, employerReviews, seekerReviews, jobs, escrows]);
}
