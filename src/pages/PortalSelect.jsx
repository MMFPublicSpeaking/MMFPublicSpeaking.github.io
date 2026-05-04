import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, ArrowRight, Sparkles, GraduationCap, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ADMIN_WHITELIST = [
  'sree.baruri@gmail.com',
  'kodekeerti11@gmail.com',
  'publicspeaking@manalonimanishi.org'
];

export default function PortalSelect() {
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const user = await base44.auth.me();
          if (user.role === 'admin' && ADMIN_WHITELIST.includes(user.email)) {
            window.location.href = createPageUrl('AdminDashboard');
          } else if (user.role === 'mentor') {
            window.location.href = createPageUrl('MentorDashboard');
          } else if (user.role === 'student') {
            window.location.href = createPageUrl('StudentDashboard');
          }
        }
      } catch (e) {
        console.log('Not authenticated');
      }
      setChecking(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async (targetRole) => {
    setError(null);
    
    // Check if user is already logged in
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const user = await base44.auth.me();
        
        // Admins can access any portal for testing purposes
        if (user.role === 'admin' && ADMIN_WHITELIST.includes(user.email)) {
          const nextUrl = targetRole === 'admin' ? createPageUrl('AdminDashboard') : 
                          targetRole === 'mentor' ? createPageUrl('MentorClasses') :
                          createPageUrl('StudentDashboard');
          window.location.href = nextUrl;
          return;
        }
        
        // Admin portal access check (non-admins)
        if (targetRole === 'admin') {
          if (!ADMIN_WHITELIST.includes(user.email)) {
            setError('You do not have admin access. Contact an administrator.');
            return;
          }
          if (user.role !== 'admin') {
            setError('Your account does not have admin privileges.');
            return;
          }
        }
        
        // Mentor portal access check
        if (targetRole === 'mentor' && user.role !== 'mentor') {
          setError('Your account does not have mentor access.');
          return;
        }
        
        // Student portal access check
        if (targetRole === 'student' && user.role !== 'student') {
          setError('Your account does not have student access.');
          return;
        }
      }
    } catch (e) {
      // Not authenticated, proceed with login
    }
    
    const nextUrl = targetRole === 'admin' ? createPageUrl('AdminDashboard') : 
                    targetRole === 'mentor' ? createPageUrl('MentorClasses') :
                    createPageUrl('StudentDashboard');
    base44.auth.redirectToLogin(nextUrl);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-blue-200 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Meet My Friend Within
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome Back
          </h1>
          <p className="text-xl text-slate-300">
            Select your portal to continue
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3 text-white backdrop-blur-sm"
          >
            <XCircle className="w-5 h-5" />
            <p>{error}</p>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              className="border-0 bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group h-full"
              onClick={() => handleLogin('mentor')}
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  Mentor Portal
                </h2>
                <p className="text-slate-600 mb-6">
                  Access your classes, track student progress, and manage assignments.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2 group-hover:translate-x-1 transition-transform">
                  Sign In as Mentor <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card 
              className="border-0 bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group h-full"
              onClick={() => handleLogin('student')}
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  Student Portal
                </h2>
                <p className="text-slate-600 mb-6">
                  View your classes, submit assignments, and track your progress.
                </p>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2 group-hover:translate-x-1 transition-transform">
                  Sign In as Student <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              className="border-0 bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 cursor-pointer group h-full"
              onClick={() => handleLogin('admin')}
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  Admin Portal
                </h2>
                <p className="text-slate-600 mb-6">
                  Manage classes, mentors, students, and oversee the program.
                </p>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2 group-hover:translate-x-1 transition-transform">
                  Sign In as Admin <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <p className="text-center text-slate-400 text-sm mt-8">
          Don't have an account? Contact your program administrator.
        </p>
      </div>
    </div>
  );
}