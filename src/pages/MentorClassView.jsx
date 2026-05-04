import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Loader2, Users, BookOpen, MessageSquare, FolderOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MentorClassAssignments from './MentorClassAssignments';
import MentorClassStream from './MentorClassStream';
import MentorProgressTracking from '../components/MentorProgressTracking';
import MentorAttendanceTracking from '../components/MentorAttendanceTracking';
import MentorSubmissions from './MentorSubmissions';

export default function MentorClassView() {
  const urlParams = new URLSearchParams(window.location.search);
  const classId = urlParams.get('id');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('MentorClassView') + '?id=' + classId);
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

  const { data: curriculum } = useQuery({
    queryKey: ['curriculum', classData?.curriculum_id],
    queryFn: async () => {
      if (!classData?.curriculum_id) return null;
      const curriculums = await base44.entities.Curriculum.filter({ id: classData.curriculum_id });
      return curriculums[0];
    },
    enabled: !!classData?.curriculum_id,
  });

  if (!user || classLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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

  // Check if mentor is assigned
  if (!classData.mentor_emails?.includes(user.email) && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-600">You are not assigned to this class.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to={createPageUrl('MentorClasses')}>
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to My Classes
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

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList>
            <TabsTrigger value="students">
              <Users className="w-4 h-4 mr-2" /> Students
            </TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="curriculum">
              <BookOpen className="w-4 h-4 mr-2" /> Curriculum
            </TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="stream">
              <MessageSquare className="w-4 h-4 mr-2" /> Stream
            </TabsTrigger>
            <TabsTrigger value="resources">
              <FolderOpen className="w-4 h-4 mr-2" /> Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Class Roster ({classData.student_emails?.length || 0} students)</CardTitle>
              </CardHeader>
              <CardContent>
                {!classData.student_emails || classData.student_emails.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600">No students enrolled yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {classData.student_emails.map((email) => (
                      <div key={email} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-medium">
                          {email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <MentorAttendanceTracking classId={classId} classData={classData} userEmail={user?.email} />
          </TabsContent>

          <TabsContent value="progress">
            <MentorProgressTracking classId={classId} classData={classData} />
          </TabsContent>

          <TabsContent value="submissions">
            <MentorSubmissions classId={classId} classData={classData} />
          </TabsContent>

          <TabsContent value="curriculum">
            <Card>
              <CardHeader>
                <CardTitle>Class Curriculum</CardTitle>
              </CardHeader>
              <CardContent>
                {!curriculum ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No curriculum assigned to this class</p>
                    <p className="text-slate-500 text-sm mt-2">Contact your administrator to assign a curriculum</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-slate-900">{curriculum.name}</h3>
                        <p className="text-sm text-slate-600">{curriculum.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{curriculum.age_group?.replace('_', ' ')}</Badge>
                          <Badge variant="outline">{curriculum.delivery_mode?.replace('_', ' ')}</Badge>
                          <Badge variant="outline">{curriculum.weeks} weeks</Badge>
                        </div>
                      </div>
                    </div>
                    {curriculum.modules && curriculum.modules.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-slate-900">Modules</h3>
                        {curriculum.modules.map((module, i) => (
                          <div key={i} className="p-4 border border-slate-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge>{`Week ${module.week}`}</Badge>
                              <h4 className="font-medium text-slate-900">{module.title}</h4>
                            </div>
                            {module.objectives && module.objectives.length > 0 && (
                              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                {module.objectives.map((obj, j) => (
                                  <li key={j}>{obj}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            <MentorClassAssignments classId={classId} classData={classData} />
          </TabsContent>

          <TabsContent value="stream">
            <MentorClassStream classId={classId} user={user} />
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