import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../lib/Button';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans">
      <header className="flex items-center justify-between p-6 border-b border-white/10 glass-dark">
        <div className="flex items-center gap-2 text-slate-100 font-bold text-2xl tracking-tight">
          <div className="w-8 h-8 match-gradient rounded-lg flex items-center justify-center text-white text-xl shadow-lg">W</div>
          WorkSphere
        </div>
        <Button onClick={() => navigate('/login')} variant="secondary">Enter Demo</Button>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
        <Badge className="mb-6 bg-indigo-500/10 text-indigo-400 border-indigo-500/20"><ShieldCheck className="w-4 h-4 mr-2 inline" /> Verified Employment Platform</Badge>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-slate-100">
          Quality work deserves<br/>
          <span className="bg-clip-text text-transparent match-gradient">fair compensation.</span>
        </h1>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          WorkSphere connects verified professionals with trusted employers, ensuring fair wages and protected payments. 
          Step out of the noise.
        </p>
        
        <div className="flex gap-4">
          <Button size="lg" onClick={() => navigate('/login')} className="h-14 px-8 text-lg rounded-full match-gradient shadow-lg">
            Enter App
          </Button>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-2xl glass">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><CheckCircle2 className="text-indigo-400 w-5 h-5"/> Fair Wage Standard</h3>
            <p className="text-slate-400 text-sm">We flag below-market salaries so you always know what your skills are actually worth.</p>
          </div>
          <div className="p-6 rounded-2xl glass">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><CheckCircle2 className="text-purple-400 w-5 h-5"/> Verified Skills</h3>
            <p className="text-slate-400 text-sm">Earn trust badges for your proven experience to stand out to premium employers.</p>
          </div>
          <div className="p-6 rounded-2xl glass">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><CheckCircle2 className="text-emerald-500 w-5 h-5"/> Escrow Payments</h3>
            <p className="text-slate-400 text-sm">Funds are secured in escrow upon hiring, protecting both parties against fraud or delays.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium border ${className || ''}`}>
      {children}
    </div>
  )
}
