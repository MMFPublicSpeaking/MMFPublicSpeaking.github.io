import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, Calendar, CheckCircle2, Clock, 
  ArrowRight, Loader2, GraduationCap, TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('StudentDashboard'));
      }
    };
    loadUser();
  }, []);

  const { data: allClasses = [], isLoading } = useQuery({
    queryKey: ['student-classes', user?.email],
    queryFn: async () => {
      const classes = await base44.entities.Class.list('-created_date', 100);
      // Admins can see all classes for testing
      if (user?.role === 'admin') return classes;
      return classes.filter(c => c.student_emails?.includes(user?.email));
    },
    enabled: !!user,
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['student-assignments', user?.email],
    queryFn: async () => {
      const classIds = allClasses.map(c => c.id);
      if (classIds.length === 0) return [];
      const allAssignments = await base44.entities.Assignment.list('-created_date', 200);
      return allAssignments.filter(a => classIds.includes(a.class_id) && a.status === 'published');
    },
    enabled: !!user && allClasses.length > 0,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['student-submissions', user?.email],
    queryFn: async () => {
      const subs = await base44.entities.Submission.list('-created_date', 200);
      return subs.filter(s => s.student_email === user?.email);
    },
    enabled: !!user,
  });

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const activeClasses = allClasses.filter(c => c.status === 'active');
  const pendingAssignments = assignments.filter(a => 
    !submissions.some(s => s.assignment_id === a.id && s.status !== 'draft')
  );
  const submittedCount = submissions.filter(s => s.status === 'submitted').length;
  const gradedCount = submissions.filter(s => s.status === 'graded').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Dashboard</h1>
              <p className="text-slate-600">Welcome back, {user.full_name || user.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">My Classes</p>
                  <p className="text-3xl font-bold">{activeClasses.length}</p>
                </div>
                <BookOpen className="w-10 h-10 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Pending</p>
                  <p className="text-3xl font-bold">{pendingAssignments.length}</p>
                </div>
                <Clock className="w-10 h-10 text-amber-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Submitted</p>
                  <p className="text-3xl font-bold">{submittedCount}</p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Graded</p>
                  <p className="text-3xl font-bold">{gradedCount}</p>
                </div>
                <Calendar className="w-10 h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="mb-8">
          <Link to={createPageUrl('StudentProgress')}>
            <Card className="hover:shadow-lg transition-all cursor-pointer group bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                        View My Progress
                      </h3>
                      <p className="text-sm text-slate-600">Track your development and mentor feedback</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Classes */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">My Classes</h2>
          
          {activeClasses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">You are not enrolled in any classes yet.</p>
                <p className="text-slate-500 text-sm mt-2">Contact your program administrator.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {activeClasses.map((classItem, i) => (
                <motion.div
                  key={classItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={createPageUrl('StudentClass') + '?id=' + classItem.id}>
                    <Card className="hover:shadow-lg transition-all cursor-pointer group">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors">
                                {classItem.name}
                              </CardTitle>
                              <Badge className="bg-emerald-100 text-emerald-700">
                                Active
                              </Badge>
                            </div>
                            {classItem.description && (
                              <p className="text-slate-600 text-sm">{classItem.description}</p>
                            )}
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="w-4 h-4" />
                            {classItem.start_date ? new Date(classItem.start_date).toLocaleDateString() : 'No date set'}
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <BookOpen className="w-4 h-4" />
                            {assignments.filter(a => a.class_id === classItem.id).length} assignments
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Assignments */}
        {pendingAssignments.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Pending Assignments</h2>
            <Card>
              <CardContent className="divide-y">
                {pendingAssignments.slice(0, 5).map((assignment) => {
                  const classItem = allClasses.find(c => c.id === assignment.class_id);
                  return (
                    <div key={assignment.id} className="py-4 first:pt-6 last:pb-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{assignment.title}</p>
                          <p className="text-sm text-slate-600">{classItem?.name}</p>
                          {assignment.due_date && (
                            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Due: {new Date(assignment.due_date).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <Link to={createPageUrl('StudentClass') + '?id=' + assignment.class_id}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}