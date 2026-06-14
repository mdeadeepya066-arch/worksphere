import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SeekerProfile, EmployerProfile } from '../types';
import { MOCK_USERS } from '../data/mock';

interface AuthContextType {
  user: User | null;
  profile: SeekerProfile | EmployerProfile | null;
  login: (email: string, role: 'seeker' | 'employer') => Promise<void>;
  logout: () => void;
  updateProfile: (updatedData: Partial<SeekerProfile>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SeekerProfile | EmployerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load or initialize all users into local storage memory
  const getUsers = (): (SeekerProfile | EmployerProfile)[] => {
    const saved = localStorage.getItem('worksphere_users');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('worksphere_users', JSON.stringify(MOCK_USERS));
    return MOCK_USERS;
  };

  const saveUsers = (users: (SeekerProfile | EmployerProfile)[]) => {
    localStorage.setItem('worksphere_users', JSON.stringify(users));
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('worksphere_auth');
    if (storedUserId) {
      const users = getUsers();
      const foundUser = users.find(u => u.id === storedUserId);
      if (foundUser) {
        setUser({ id: foundUser.id, email: foundUser.email, name: foundUser.name, role: foundUser.role });
        setProfile(foundUser);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, role: 'seeker' | 'employer') => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = getUsers();
    let foundProfile = users.find(u => u.email === email);
    
    if (!foundProfile) {
       if (role === 'seeker') {
         foundProfile = {
           id: Math.random().toString(36).substr(2, 9),
           email,
           name: email.split('@')[0],
           role: 'seeker',
           phone: '',
           location: '',
           skills: [],
           education: [],
           experience: [],
           certifications: [],
           preferredCategories: [],
           preferredWorkTypes: [],
           profileCompletion: 20,
           trustBadges: []
         } as SeekerProfile;
       } else {
         foundProfile = {
           id: Math.random().toString(36).substr(2, 9),
           email,
           name: email.split('@')[0],
           role: 'employer',
           companyName: 'New Company',
           industry: '',
           location: '',
           description: '',
           rating: 0,
           reviewCount: 0
         } as EmployerProfile;
       }
       users.push(foundProfile);
       saveUsers(users);
    }

    if (foundProfile.role !== role) {
      setIsLoading(false);
      throw new Error("Invalid role for this email");
    }

    localStorage.setItem('worksphere_auth', foundProfile.id);
    setUser({ id: foundProfile.id, email: foundProfile.email, name: foundProfile.name, role: foundProfile.role });
    setProfile(foundProfile);
    setIsLoading(false);
  };

  const updateProfile = (updatedData: Partial<SeekerProfile>) => {
    if (!profile || profile.role !== 'seeker') return;

    const data = { ...profile, ...updatedData } as SeekerProfile;
    
    // Calculate completion score
    let score = 20; // Base info
    if (data.skills && data.skills.length > 0) score += 15;
    if (data.experience && data.experience.length > 0) score += 15;
    if (data.education && data.education.length > 0) score += 15;
    if (data.resumeUrl) score += 15;
    if ((data.certifications && data.certifications.length > 0) || data.hasNoCertifications) score += 10;
    if (data.preferredWorkTypes && data.preferredWorkTypes.length > 0) score += 10;
    
    data.profileCompletion = Math.min(score, 100);

    // Badges
    const badges = new Set(data.trustBadges);
    // Verified Skill badge
    if (data.certifications && data.certifications.length > 0) {
      badges.add('Verified Skill');
    } else {
      badges.delete('Verified Skill');
    }
    // Profile Complete badge
    if (data.profileCompletion === 100) {
      badges.add('Profile Complete');
    } else {
      badges.delete('Profile Complete');
    }
    // Trusted Candidate badge
    if (data.profileCompletion >= 80) {
      badges.add('Trusted Candidate');
    } else {
      badges.delete('Trusted Candidate');
    }
    data.trustBadges = Array.from(badges);

    const users = getUsers();
    const index = users.findIndex(u => u.id === profile.id);
    if (index !== -1) {
      users[index] = data;
      saveUsers(users);
    }
    
    setProfile(data);
    setUser(prev => prev ? { ...prev, name: data.name } : null);
  };

  const logout = () => {
    localStorage.removeItem('worksphere_auth');
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, login, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
