import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, Users, BookOpen, FolderOpen, UserPlus, 
  Mail, Calendar, TrendingUp, ArrowRight, Loader2,
  CheckCircle2, XCircle, UserCog
} from 'lucide-react';

const ADMIN_WHITELIST = [
  'sree.baruri@gmail.com',
  'kodekeerti11@gmail.com',
  'publicspeaking@manalonimanishi.org'
];
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState(null);
  const [isInviting, setIsInviting] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        if (userData.role !== 'admin' || !ADMIN_WHITELIST.includes(userData.email)) {
          window.location.href = createPageUrl('PortalSelect');
          return;
        }
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('AdminDashboard'));
      }
    };
    loadUser();
  }, []);

  const { data: allMentors = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 200),
    enabled: !!user,
  });

  const { data: allMentees = [] } = useQuery({
    queryKey: ['all-mentees'],
    queryFn: () => base44.entities.Mentee.list('-created_date', 200),
    enabled: !!user,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => base44.entities.Class.list('-created_date', 100),
    enabled: !!user,
  });

  const handleInviteMentor = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      setInviteStatus({ type: 'error', message: 'Please enter a valid email' });
      return;
    }

    setIsInviting(true);
    setInviteStatus(null);

    try {
      await base44.users.inviteUser(inviteEmail, 'mentor');
      setInviteStatus({ type: 'success', message: 'Mentor invited successfully!' });
      setInviteEmail('');
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      setTimeout(() => {
        setIsInviteDialogOpen(false);
        setInviteStatus(null);
      }, 2000);
    } catch (error) {
      setInviteStatus({ type: 'error', message: error.message || 'Failed to invite mentor' });
    } finally {
      setIsInviting(false);
    }
  };

  const mentors = allMentors.filter(u => u.role === 'mentor');
  const admins = allMentors.filter(u => u.role === 'admin');
  const activeMentees = allMentees.filter(m => m.status === 'active');

  const quickActions = [
    { 
      title: "Class Management", 
      description: "Create classes, assign mentors and students",
      icon: Users, 
      href: "AdminClasses",
      color: "bg-indigo-500"
    },
    { 
      title: "Curriculum Management", 
      description: "Create and manage curriculums by age/format",
      icon: BookOpen, 
      href: "AdminCurriculums",
      color: "bg-purple-500"
    },
    { 
      title: "Account Management", 
      description: "Invite and manage mentors, students, admins",
      icon: UserCog, 
      href: "AdminAccounts",
      color: "bg-blue-500"
    },
    { 
      title: "Resources", 
      description: "Manage resource library",
      icon: FolderOpen, 
      href: "Resources",
      color: "bg-amber-500"
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                  <p className="text-slate-600 mt-1">
                    Welcome back, {user?.full_name}
                  </p>
                </div>
              </div>
            </div>
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                  <UserPlus className="w-4 h-4" /> Invite Mentor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite New Mentor</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Mentor Email</Label>
                    <Input 
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="mentor@example.com"
                      onKeyDown={(e) => e.key === 'Enter' && handleInviteMentor()}
                    />
                  </div>
                  
                  {inviteStatus && (
                    <div className={`p-3 rounded-lg flex items-center gap-2 ${
                      inviteStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {inviteStatus.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      {inviteStatus.message}
                    </div>
                  )}
                  
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleInviteMentor}
                    disabled={isInviting}
                  >
                    {isInviting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    Send Invitation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm">Active Classes</p>
                  <p className="text-3xl font-bold">{classes.filter(c => c.status === 'active').length}</p>
                </div>
                <BookOpen className="w-10 h-10 text-indigo-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Mentors</p>
                  <p className="text-3xl font-bold">{mentors.length}</p>
                </div>
                <Users className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Total Students</p>
                  <p className="text-3xl font-bold">
                    {classes.reduce((sum, c) => sum + (c.student_emails?.length || 0), 0)}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Admins</p>
                  <p className="text-3xl font-bold">{admins.length}</p>
                </div>
                <Shield className="w-10 h-10 text-amber-200" />
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
                  {action.href ? (
                    <Link to={createPageUrl(action.href)}>
                      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-0 bg-white h-full">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center text-white`}>
                              <action.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {action.title}
                              </h3>
                              <p className="text-sm text-slate-500 mt-1">{action.description}</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ) : (
                    <Card 
                      className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-0 bg-white h-full"
                      onClick={action.onClick}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center text-white`}>
                            <action.icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {action.title}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">{action.description}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mentors List */}
          <div className="space-y-6">
            <Card className="border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                  Active Mentors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mentors.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-slate-500 text-sm mb-3">No mentors yet</p>
                    <Button size="sm" variant="outline" onClick={() => setIsInviteDialogOpen(true)}>
                      Invite Mentor
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mentors.slice(0, 5).map((mentor) => (
                      <div key={mentor.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                          {mentor.full_name?.charAt(0) || mentor.email?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{mentor.full_name || mentor.email}</p>
                          <p className="text-xs text-slate-500 truncate">{mentor.email}</p>
                        </div>
                      </div>
                    ))}
                    {mentors.length > 5 && (
                      <p className="text-sm text-slate-500 text-center pt-2">
                        + {mentors.length - 5} more mentors
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}