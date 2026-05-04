import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Loader2, Calendar, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import StudentSubmissionForm from '../components/StudentSubmissionForm';

export default function StudentClass() {
  const urlParams = new URLSearchParams(window.location.search);
  const classId = urlParams.get('id');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('StudentClass') + '?id=' + classId);
      }
    };
    loadUser();
  }, [classId]);

  const { data: classData, isLoading: classLoading } = useQuery({
    queryKey: ['class', classId],
    queryFn: async () => {
      const classes = await base44.entities.Class.filter({ id: classId });
      return classes[0];
    },
    enabled: !!classId,
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['class-assignments', classId],
    queryFn: async () => {
      const allAssignments = await base44.entities.Assignment.list('-created_date', 200);
      return allAssignments.filter(a => a.class_id === classId && a.status === 'published');
    },
    enabled: !!classId,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['student-submissions', user?.email],
    queryFn: async () => {
      const subs = await base44.entities.Submission.list('-created_date', 200);
      return subs.filter(s => s.student_email === user?.email);
    },
    enabled: !!user,
  });

  if (!user || classLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p>Class not found</p>
      </div>
    );
  }

  // Check if student is enrolled (admins can view any class for testing)
  if (!classData.student_emails?.includes(user.email) && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-600">You are not enrolled in this class.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to={createPageUrl('StudentDashboard')}>
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{classData.name}</h1>
              <p className="text-slate-600 mt-1">{classData.description}</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700">
              Active
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="assignments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="stream">Class Stream</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-4">
            {assignments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No assignments yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => {
                  const submission = submissions.find(s => s.assignment_id === assignment.id);
                  return (
                    <Card key={assignment.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            {assignment.due_date && (
                              <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                                <Calendar className="w-4 h-4" />
                                Due: {new Date(assignment.due_date).toLocaleString()}
                              </div>
                            )}
                          </div>
                          <Badge className={
                            submission?.status === 'graded' ? 'bg-green-100 text-green-700' :
                            submission?.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }>
                            {submission?.status === 'graded' ? 'Graded' :
                             submission?.status === 'submitted' ? 'Submitted' :
                             'Pending'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-600 whitespace-pre-wrap mb-4">{assignment.description}</p>
                        
                        <div className="flex justify-end">
                          <StudentSubmissionForm
                            assignment={assignment}
                            existingSubmission={submission}
                            studentEmail={user.email}
                          />
                        </div>

                        {submission?.status === 'graded' && submission.feedback && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="font-medium text-slate-900 mb-2">Mentor Feedback</p>
                            <p className="text-slate-700 whitespace-pre-wrap">{submission.feedback}</p>
                            {submission.grade !== null && assignment.points && (
                              <p className="text-sm text-slate-600 mt-2">
                                Grade: {submission.grade} / {assignment.points}
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stream">
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-slate-600">Class stream coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-slate-600">Class resources coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}