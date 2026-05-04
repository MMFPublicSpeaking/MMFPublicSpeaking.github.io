import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, Users, FolderOpen, Award, ArrowRight, 
  Calendar, TrendingUp, Clock, CheckCircle2, Sparkles,
  MessageCircle, Target
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MentorDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        if (userData.role === 'admin') {
          window.location.href = createPageUrl('AdminDashboard');
          return;
        }
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('MentorDashboard'));
      }
    };
    loadUser();
  }, []);

  const { data: modules = [] } = useQuery({
    queryKey: ['modules'],
    queryFn: () => base44.entities.Module.filter({ status: 'published' }, 'week_number', 50),
  });

  const { data: mentees = [] } = useQuery({
    queryKey: ['mentees'],
    queryFn: () => base44.entities.Mentee.filter(
      user?.email ? { mentor_email: user.email } : {},
      '-created_date',
      50
    ),
    enabled: !!user,
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['resources-featured'],
    queryFn: () => base44.entities.Resource.filter({ featured: true }, '-created_date', 5),
  });

  const currentWeekModule = modules.find(m => m.week_number === Math.ceil((new Date().getDate()) / 7)) || modules[0];
  const activeMentees = mentees.filter(m => m.status === 'active');

  const quickActions = [
    { 
      title: "My Classes", 
      description: "View and manage your assigned classes",
      icon: BookOpen, 
      href: "MentorClasses",
      color: "bg-blue-500"
    },
    { 
      title: "My Mentees (Legacy)", 
      description: "Track progress and add session notes",
      icon: Users, 
      href: "Mentees",
      color: "bg-emerald-500"
    },
    { 
      title: "Resource Library", 
      description: "Guides, templates, and training materials",
      icon: FolderOpen, 
      href: "Resources",
      color: "bg-purple-500"
    },
    { 
      title: "Community", 
      description: "Share tips and success stories",
      icon: Award, 
      href: "Community",
      color: "bg-amber-500"
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
              </h1>
              <p className="text-slate-600 mt-1">
                Here's what's happening with your mentees
              </p>
            </div>
            <div className="flex gap-3">
              <Link to={createPageUrl('Mentees')}>
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <Users className="w-4 h-4" /> View Mentees
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Active Mentees</p>
                  <p className="text-3xl font-bold">{activeMentees.length}</p>
                </div>
                <Users className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Curriculum Weeks</p>
                  <p className="text-3xl font-bold">{modules.length}</p>
                </div>
                <BookOpen className="w-10 h-10 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Resources</p>
                  <p className="text-3xl font-bold">{resources.length}+</p>
                </div>
                <FolderOpen className="w-10 h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Current Week</p>
                  <p className="text-3xl font-bold">{currentWeekModule?.week_number || 1}</p>
                </div>
                <Calendar className="w-10 h-10 text-amber-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-slate-900">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {quickActions.map((action, i) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={createPageUrl(action.href)}>
                    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-0 bg-white">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center text-white`}>
                            <action.icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {action.title}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">{action.description}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* This Week's Module */}
            {currentWeekModule && (
              <Card className="border-0 bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      This Week's Focus
                    </CardTitle>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Week {currentWeekModule.week_number}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {currentWeekModule.title}
                  </h3>
                  <p className="text-slate-600 mb-4">{currentWeekModule.description}</p>
                  
                  {currentWeekModule.learning_objectives?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-slate-700 mb-2">Learning Objectives:</p>
                      <ul className="space-y-1">
                        {currentWeekModule.learning_objectives.slice(0, 3).map((obj, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Link to={createPageUrl(`Curriculum?week=${currentWeekModule.week_number}`)}>
                    <Button variant="outline" className="gap-2">
                      View Full Module <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Mentees */}
            <Card className="border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-emerald-600" />
                  Your Mentees
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeMentees.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-slate-500 text-sm mb-3">No mentees added yet</p>
                    <Link to={createPageUrl('Mentees')}>
                      <Button size="sm" variant="outline">Add Mentee</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeMentees.slice(0, 4).map((mentee) => (
                      <div key={mentee.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                          {mentee.name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{mentee.name}</p>
                          <p className="text-xs text-slate-500">Week {mentee.current_week || 1}</p>
                        </div>
                      </div>
                    ))}
                    {activeMentees.length > 4 && (
                      <Link to={createPageUrl('Mentees')} className="block">
                        <Button variant="ghost" className="w-full text-sm">
                          View all {activeMentees.length} mentees
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Featured Resources */}
            <Card className="border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Featured Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resources.slice(0, 3).map((resource) => (
                    <Link 
                      key={resource.id} 
                      to={createPageUrl(`Resources?id=${resource.id}`)}
                      className="block p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
                    >
                      <p className="font-medium text-slate-900 text-sm">{resource.title}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {resource.type?.replace('_', ' ')}
                      </Badge>
                    </Link>
                  ))}
                  <Link to={createPageUrl('Resources')}>
                    <Button variant="ghost" className="w-full text-sm">
                      Browse all resources
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}