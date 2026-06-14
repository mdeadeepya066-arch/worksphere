import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../lib/Button';
import { Input } from '../lib/Input';
import { Briefcase, User as UserIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export function Login() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'seeker' | 'employer'>('seeker');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.formEvent = e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email');
      return;
    }

    try {
      await login(email, role);
      navigate(`/${role}/dashboard`);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative blurred blob */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 blur-[128px]"></div>
      <div className="w-full max-w-md space-y-8 relative z-10 glass-dark p-8 rounded-[2rem]">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl match-gradient flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
            W
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Sign in</h2>
          <p className="mt-2 text-sm text-slate-400">Enter your mock credentials to continue</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('seeker')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all",
                    role === 'seeker' 
                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-400 font-medium" 
                      : "border-white/5 glass text-slate-400 hover:bg-white/5"
                  )}
                >
                  <UserIcon className="w-6 h-6 mb-1" />
                  <span className="font-semibold text-sm">Job Seeker</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('employer')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all",
                    role === 'employer' 
                      ? "border-purple-500 bg-purple-500/10 text-purple-400 font-medium" 
                      : "border-white/5 glass text-slate-400 hover:bg-white/5"
                  )}
                >
                  <Briefcase className="w-6 h-6 mb-1" />
                  <span className="font-semibold text-sm">Employer</span>
                </button>
              </div>
            </div>

            <Input 
              label="Email address"
              type="email" 
              placeholder="e.g. user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          </div>

          <Button type="submit" className="w-full h-12" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In / Register'}
          </Button>
          
          <div className="text-center">
            <p className="text-xs text-slate-500 space-y-1">
              Try: <br/>
              <b>seeker@worksphere.com</b> for Seeker Demo<br/>
              <b>employer@techcorp.com</b> for Employer Demo
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
