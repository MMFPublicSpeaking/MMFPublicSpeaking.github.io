import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { 
  BookOpen, Users, FolderOpen, Award, Home, 
  Menu, X, ChevronDown, GraduationCap, LogOut,
  LayoutDashboard, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
        }
      } catch (e) {
        console.log('Not authenticated');
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const mentorNav = [
    { name: 'Dashboard', href: 'MentorDashboard', icon: LayoutDashboard },
    { name: 'Curriculum', href: 'Curriculum', icon: BookOpen },
    { name: 'My Mentees', href: 'Mentees', icon: Users },
    { name: 'Contact', href: 'MentorContact', icon: MessageSquare },
    { name: 'Resources', href: 'Resources', icon: FolderOpen },
    { name: 'Community', href: 'Community', icon: Award },
  ];

  const studentNav = [
    { name: 'Student Hub', href: 'StudentHub', icon: GraduationCap },
    { name: 'Contact', href: 'StudentContact', icon: MessageSquare },
    { name: 'Resources', href: 'StudentResources', icon: FolderOpen },
  ];

  const isStudentPage = ['StudentHub', 'StudentResources'].includes(currentPageName);
  const isLandingPage = currentPageName === 'Home';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to={createPageUrl('Home')} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div className="hidden sm:block">
                  <span className="font-semibold text-slate-900 text-lg">MMF</span>
                  <span className="text-slate-500 text-sm ml-2">Speaking Skills</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {!isLandingPage && user && (
                <>
                  {user.role === 'admin' && (
                    <Link to={createPageUrl('AdminDashboard')}>
                      <Button variant="ghost" className="gap-1">
                        <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                      </Button>
                    </Link>
                  )}
                  {user.role === 'mentor' && (
                    <Link to={createPageUrl('MentorClasses')}>
                      <Button variant="ghost" className="gap-1">
                        <LayoutDashboard className="w-4 h-4" /> Mentor Dashboard
                      </Button>
                    </Link>
                  )}
                  {user.role === 'student' && (
                    <Link to={createPageUrl('StudentDashboard')}>
                      <Button variant="ghost" className="gap-1">
                        <LayoutDashboard className="w-4 h-4" /> Student Dashboard
                      </Button>
                    </Link>
                  )}
                </>
              )}

              {/* Auth */}
              {!isLoading && (
                user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="ml-2">
                        {user.full_name || user.email}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => base44.auth.logout(createPageUrl('Home'))}>
                        <LogOut className="w-4 h-4 mr-2" /> Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link to={createPageUrl('PortalSelect')}>
                    <Button className="ml-2 bg-blue-600 hover:bg-blue-700">
                      Sign In
                    </Button>
                  </Link>
                )
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider py-2">
                Mentor Portal
              </div>
              {mentorNav.map((item) => (
                <Link
                  key={item.name}
                  to={createPageUrl(item.href)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider py-2 mt-4">
                Student Portal
              </div>
              {studentNav.map((item) => (
                <Link
                  key={item.name}
                  to={createPageUrl(item.href)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-slate-600 text-sm">Meet My Friend Within</span>
            </div>
            <div className="text-slate-500 text-sm">
              © 2026 Meet My Friend Within. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}