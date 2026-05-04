import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, User, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StudentContact() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('StudentContact'));
      }
    };
    loadUser();
  }, []);

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
    enabled: !!user,
  });

  const { data: myClasses = [], isLoading: classesLoading } = useQuery({
    queryKey: ['student-classes', user?.email],
    queryFn: async () => {
      const classes = await base44.entities.Class.list('-created_date', 100);
      if (user?.role === 'admin') return classes;
      return classes.filter(c => c.student_emails?.includes(user?.email));
    },
    enabled: !!user,
  });

  if (!user || usersLoading || classesLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Get unique mentor emails from student's classes
  const mentorEmails = [...new Set(myClasses.flatMap(c => c.mentor_emails || []))];
  const myMentors = allUsers.filter(u => mentorEmails.includes(u.email));

  const renderContactCard = (person) => (
    <Card key={person.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-lg">
            {person.full_name?.charAt(0) || person.email?.charAt(0) || '?'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-slate-900">{person.full_name || person.email}</h3>
              <Badge className="bg-blue-100 text-blue-700">
                Mentor
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${person.email}`} className="hover:text-blue-600">
                  {person.email}
                </a>
              </div>
              {person.phone && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${person.phone}`} className="hover:text-blue-600">
                    {person.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={createPageUrl('StudentDashboard')}>
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Mentors</h1>
              <p className="text-slate-600">Contact information for your mentors</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {myMentors.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No mentors assigned yet</p>
                <p className="text-slate-500 text-sm mt-2">You'll see your mentor contacts once you're enrolled in a class</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {myMentors.map(renderContactCard)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}