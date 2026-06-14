import { Application, EmployerProfile, EscrowTransaction, Job, EmployerReview, SeekerReview, SeekerProfile, StandardWage } from "../types";
import { subDays, subHours } from "date-fns";

export const MOCK_STANDARDS: StandardWage[] = [
  { category: 'Trades', title: 'Electrician', min: 400, max: 800, type: 'day' },
  { category: 'Trades', title: 'Plumber', min: 350, max: 700, type: 'day' },
  { category: 'Trades', title: 'Carpenter', min: 400, max: 750, type: 'day' },
  { category: 'Trades', title: 'Welder', min: 450, max: 800, type: 'day' },
  { category: 'Trades', title: 'Mechanic', min: 400, max: 900, type: 'day' },
  { category: 'Trades', title: 'Driver', min: 500, max: 1000, type: 'day' },
  { category: 'Trades', title: 'Construction Supervisor', min: 1000, max: 2000, type: 'day' },
  { category: 'Education', title: 'Tutor', min: 150, max: 400, type: 'hour' },
  { category: 'Education', title: 'School Teacher', min: 25000, max: 55000, type: 'month' },
  { category: 'Education', title: 'Lecturer', min: 40000, max: 85000, type: 'month' },
  { category: 'IT', title: 'Software Developer', min: 35000, max: 90000, type: 'month' },
  { category: 'IT', title: 'Frontend Developer', min: 35000, max: 85000, type: 'month' },
  { category: 'IT', title: 'Backend Developer', min: 40000, max: 95000, type: 'month' },
  { category: 'IT', title: 'Full Stack Developer', min: 45000, max: 110000, type: 'month' },
  { category: 'Healthcare', title: 'Nurse', min: 25000, max: 60000, type: 'month' },
  { category: 'Healthcare', title: 'Lab Technician', min: 18000, max: 35000, type: 'month' },
  { category: 'Healthcare', title: 'Pharmacist', min: 20000, max: 45000, type: 'month' },
  { category: 'Healthcare', title: 'Caregiver', min: 150, max: 350, type: 'hour' },
  { category: 'Creative', title: 'Graphic Designer', min: 18000, max: 45000, type: 'month' },
  { category: 'Creative', title: 'Content Writer', min: 15000, max: 40000, type: 'month' },
  { category: 'Creative', title: 'Video Editor', min: 20000, max: 50000, type: 'month' },
  { category: 'Non-Tech', title: 'HR Executive', min: 20000, max: 45000, type: 'month' },
  { category: 'Non-Tech', title: 'Sales Executive', min: 15000, max: 40000, type: 'month' },
  { category: 'Non-Tech', title: 'Accountant', min: 22000, max: 50000, type: 'month' },
];

export const MOCK_USERS: (SeekerProfile | EmployerProfile)[] = [
  {
    id: 's1',
    email: 'seeker@worksphere.com',
    name: 'Rahul Sharma',
    role: 'seeker',
    phone: '+91 9876543210',
    location: 'Mumbai, MH',
    skills: [
      { name: 'React', verified: true },
      { name: 'TypeScript', verified: true },
      { name: 'Node.js', verified: false }
    ],
    education: ['B.Tech Computer Science, Mumbai University (2018-2022)'],
    experience: ['Frontend Developer at TechCorps (2022-Present)'],
    certifications: ['AWS Certified Developer Associate'],
    profileCompletion: 85,
    trustBadges: ['Verified Skill', 'Trusted Candidate'],
    rating: 4.5,
    reviewCount: 2,
    trustScore: 82,
    completedJobs: 2
  },
  {
    id: 'e1',
    email: 'employer@techcorp.com',
    name: 'Jane Doe',
    role: 'employer',
    companyName: 'TechCorp Solutions',
    industry: 'Information Technology',
    location: 'Bangalore, KA',
    description: 'Leading provider of IT services and digital transformation.',
    rating: 4.8,
    reviewCount: 124
  }
];

export const MOCK_JOBS: Job[] = [];

export const MOCK_APPLICATIONS: Application[] = [];

export const MOCK_EMPLOYER_REVIEWS: EmployerReview[] = [];

export const MOCK_SEEKER_REVIEWS: SeekerReview[] = [];

export const MOCK_ESCROWS: EscrowTransaction[] = [];
