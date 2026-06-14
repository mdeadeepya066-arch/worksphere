export type Role = 'seeker' | 'employer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
}

export interface Skill {
  name: string;
  verified: boolean;
}

export interface SeekerProfile extends User {
  role: 'seeker';
  phone: string;
  location: string;
  skills: Skill[];
  education: string[];
  experience: string[];
  certifications: string[];
  hasNoCertifications?: boolean;
  resumeUrl?: string;
  preferredCategories?: string[];
  preferredWorkTypes?: string[];
  profileCompletion: number;
  trustBadges: string[];
  rating: number;
  reviewCount: number;
  trustScore: number;
  completedJobs: number;
}

export interface EmployerProfile extends User {
  role: 'employer';
  companyName: string;
  industry: string;
  location: string;
  description: string;
  rating: number;
  reviewCount: number;
}

export interface Job {
  id: string;
  employerId: string;
  employerName: string;
  companyName: string;
  title: string;
  category: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  salaryType: 'hour' | 'day' | 'month' | 'year';
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance';
  requiredSkills: string[];
  experienceRequired: string; // e.g., '2-4 years'
  description: string;
  createdAt: string;
  status: 'active' | 'closed';
  isPostJobFlow?: boolean;
}

export type ApplicationStatus = 'Applied' | 'Under Review' | 'Shortlisted' | 'Rejected' | 'Hired' | 'Completed' | 'Accepted';

export interface Application {
  id: string;
  jobId: string;
  seekerId: string;
  status: ApplicationStatus;
  appliedAt: string;
  matchScore: number;
}

export interface EmployerReview {
  id: string;
  applicationId: string;
  employerId: string;
  seekerId: string;
  rating: number;
  comment: string;
  categories: {
    safety: number;
    payment: number;
    communication: number;
    professionalism: number;
    workEnvironment?: number;
    paymentFairness?: number;
    jobAccuracy?: number;
  };
  createdAt: string;
}

export interface SeekerReview {
  id: string;
  applicationId: string;
  employerId: string;
  seekerId: string;
  rating: number;
  comment: string;
  categories: {
    skillQuality: number;
    workCompletion: number;
    punctuality: number;
    communication: number;
    professionalism: number;
  };
  createdAt: string;
}

export type EscrowStatus = 'Pending' | 'Reserved' | 'In Progress' | 'Completed' | 'Released';

export interface EscrowTransaction {
  id: string;
  applicationId: string;
  amount: number;
  status: EscrowStatus;
  createdAt: string;
}

export interface StandardWage {
  category: string;
  title: string;
  min: number;
  max: number;
  type: 'hour' | 'day' | 'month' | 'year';
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  savedAt: string;
}

