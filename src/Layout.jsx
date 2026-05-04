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
    let isMounted = true; // Prevents memory leaks if component unmounts
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth && isMounted) {
          const userData = await base44.auth.me();
          setUser(userData);
        }
      } catch (e) {
        console.error('Authentication check failed:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    checkAuth();
    return () => { isMounted = false; };
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

  const isLandingPage = currentPageName === 'Home';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
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

            <div className="hidden md:flex items-center gap-1">
              {!isLoading && user && !isLandingPage && (
                <>
                  {user.role === 'admin' && (
                    <Link to={createPageUrl('AdminDashboard')}>
                      <Button variant="ghost" className="gap-1">
                        <LayoutDashboard className="w-4 h-4" /> Admin
                      </Button>
                    </Link>
                  )}
                  {user.role === 'mentor' && (
                    <Link to={createPageUrl('MentorClasses')}>
                      <Button variant="ghost" className="gap-1">
                        <LayoutDashboard className="w-4 h-4" /> Mentor
                      </Button>
                    </Link>
                  )}
                  {user.role === 'student' && (
                    <Link to={createPageUrl('StudentDashboard')}>
                      <Button variant="ghost" className="gap-1">
                        <LayoutDashboard className="