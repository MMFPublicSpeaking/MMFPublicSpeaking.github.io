import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, Calendar, BookOpen, ArrowRight, Loader2, GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MentorClasses() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('MentorClasses'));
      }
    };
    loadUser();
  }, []);

  const { data: allClasses = [], isLoading } = useQuery({
    queryKey: ['mentor-classes', user?.email],
    queryFn: async () => {
      const classes = await base44.entities.Class.list('-created_date', 100);
      // Admins can see all classes for testing
      if (user?.role === 'admin') return classes;
      return classes.filter(c => c.mentor_emails?.includes(user?.email));
    },
    enabled: !!user,
  });

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const activeClasses = allClasses.filter(c => c.status === 'active');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Classes</h1>
          <p className="text-slate-600 mt-1">Select a class to manage assignments, students, and curriculum</p>
        </div>

        {activeClasses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">You are not assigned to any classes yet.</p>
              <p className="text-slate-500 text-sm mt-2">Contact your program administrator.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {activeClasses.map((classItem, i) => (
              <motion.div
                key={classItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={createPageUrl('MentorClassView') + '?id=' + classItem.id}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer group h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
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
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                          <Users className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-xs text-slate-500">Students</p>
                            <p className="font-semibold text-slate-900">
                              {classItem.student_emails?.length || 0}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                          <Calendar className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="text-xs text-slate-500">Start Date</p>
                            <p className="font-semibold text-slate-900 text-sm">
                              {classItem.start_date ? new Date(classItem.start_date).toLocaleDateString() : 'Not set'}
                            </p>
                          </div>
                        </div>
                      </div>
                      {classItem.age_group && (
                        <div className="mt-3 flex gap-2">
                          <Badge variant="outline">{classItem.age_group.replace('_', ' ')}</Badge>
                          {classItem.delivery_mode && (
                            <Badge variant="outline">{classItem.delivery_mode.replace('_', ' ')}</Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}