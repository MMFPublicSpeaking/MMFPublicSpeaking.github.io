import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, UserPlus, X, Save, ArrowLeft, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MentorClassAssignments from './MentorClassAssignments';
import MentorClassStream from './MentorClassStream';
import MentorProgressTracking from '../components/MentorProgressTracking';
import MentorAttendanceTracking from '../components/MentorAttendanceTracking';
import MentorSubmissions from './MentorSubmissions';

export default function AdminClassDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const classId = urlParams.get('id');
  const [selectedMentors, setSelectedMentors] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const queryClient = useQueryClient();

  const { data: classData, isLoading: classLoading } = useQuery({
    queryKey: ['class', classId],
    queryFn: async () => {
      const classes = await base44.entities.Class.filter({ id: classId });
      return classes[0];
    },
    enabled: !!classId,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
  });

  const { data: curriculums = [] } = useQuery({
    queryKey: ['curriculums'],
    queryFn: () => base44.entities.Curriculum.list('-created_date', 100),
  });

  useEffect(() => {
    if (classData) {
      setSelectedMentors(classData.mentor_emails || []);
      setSelectedStudents(classData.student_emails || []);
    }
  }, [classData]);

  const updateClassMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Class.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class', classId] });
    },
  });

  const handleSaveAssignments = () => {
    updateClassMutation.mutate({
      id: classId,
      data: {
        mentor_emails: selectedMentors,
        student_emails: selectedStudents
      }
    });
  };

  const mentors = allUsers.filter(u => u.role === 'mentor');
  const students = allUsers.filter(u => u.role === 'student');

  const availableMentors = mentors.filter(m => !selectedMentors.includes(m.email));
  const availableStudents = students.filter(s => !selectedStudents.includes(s.email));

  if (classLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to={createPageUrl('AdminClasses')}>
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Classes
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{classData.name}</h1>
              <p className="text-slate-600 mt-1">{classData.description}</p>
            </div>
            <Badge className={classData.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
              {classData.status}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="roster" className="space-y-6">
          <TabsList>
            <TabsTrigger value="roster">Class Roster</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="stream">Class Stream</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="roster" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Assigned Mentors</CardTitle>
                <Button 
                  onClick={handleSaveAssignments}
                  disabled={updateClassMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                >
                  {updateClassMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Add Mentor</Label>
                  <Select
                    value=""
                    onValueChange={(email) => {
                      if (email && !selectedMentors.includes(email)) {
                        setSelectedMentors([...selectedMentors, email]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a mentor to add..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMentors.map((mentor) => (
                        <SelectItem key={mentor.email} value={mentor.email}>
                          {mentor.full_name || mentor.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  {selectedMentors.map((email) => {
                    const mentor = mentors.find(m => m.email === email);
                    return (
                      <div key={email} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                            {mentor?.full_name?.charAt(0) || email.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{mentor?.full_name || email}</p>
                            <p className="text-sm text-slate-600">{email}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMentors(selectedMentors.filter(e => e !== email))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students ({selectedStudents.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Add Student</Label>
                  <Select
                    value=""
                    onValueChange={(email) => {
                      if (email && !selectedStudents.includes(email)) {
                        setSelectedStudents([...selectedStudents, email]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student to add..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStudents.map((student) => (
                        <SelectItem key={student.email} value={student.email}>
                          {student.full_name || student.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  {selectedStudents.map((email) => {
                    const student = students.find(s => s.email === email);
                    return (
                      <div key={email} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-medium">
                            {student?.full_name?.charAt(0) || email.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{student?.full_name || email}</p>
                            <p className="text-sm text-slate-600">{email}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedStudents(selectedStudents.filter(e => e !== email))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
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

          <TabsContent value="assignments">
            <MentorClassAssignments classId={classId} classData={classData} />
          </TabsContent>

          <TabsContent value="stream">
            <MentorClassStream classId={classId} user={user} />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Class Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Assigned Curriculum</Label>
                  <Select
                    value={classData.curriculum_id || ""}
                    onValueChange={async (value) => {
                      try {
                        // Import curriculum assignments
                        const selectedCurriculum = curriculums.find(c => c.id === value);
                        if (selectedCurriculum?.modules) {
                          const assignmentsToCreate = [];
                          selectedCurriculum.modules.forEach((module) => {
                            if (module.assignments && module.assignments.length > 0) {
                              module.assignments.forEach((assignment) => {
                                assignmentsToCreate.push({
                                  class_id: classId,
                                  title: `Week ${module.week}: ${assignment.title}`,
                                  description: assignment.description || '',
                                  submission_type: assignment.submission_type || 'text',
                                  points: assignment.points || 100,
                                  status: 'published'
                                });
                              });
                            }
                          });
                          
                          if (assignmentsToCreate.length > 0) {
                            await base44.entities.Assignment.bulkCreate(assignmentsToCreate);
                          }
                        }
                        
                        // Update class with curriculum
                        await base44.entities.Class.update(classId, { curriculum_id: value });
                        queryClient.invalidateQueries({ queryKey: ['class', classId] });
                      } catch (error) {
                        console.error('Error assigning curriculum:', error);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a curriculum..." />
                    </SelectTrigger>
                    <SelectContent>
                      {curriculums.filter(c => c.status === 'published').map((curriculum) => (
                        <SelectItem key={curriculum.id} value={curriculum.id}>
                          {curriculum.name} ({curriculum.age_group?.replace('_', ' ')} - {curriculum.delivery_mode?.replace('_', ' ')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}