import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, User, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MentorContact() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        if (userData.role !== 'mentor' && userData.role !== 'admin') {
          window.location.href = createPageUrl('PortalSelect');
          return;
        }
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('MentorContact'));
      }
    };
    loadUser();
  }, []);

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
    enabled: !!user,
  });

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const mentors = allUsers.filter(u => u.role === 'mentor');
  const admins = allUsers.filter(u => u.role === 'admin');
  const students = allUsers.filter(u => u.role === 'student');

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
              <Badge className={
                person.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                person.role === 'mentor' ? 'bg-blue-100 text-blue-700' :
                'bg-emerald-100 text-emerald-700'
              }>
                {person.role}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={createPageUrl(user.role === 'admin' ? 'AdminDashboard' : 'MentorDashboard')}>
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
              <h1 className="text-3xl font-bold text-slate-900">Contact Directory</h1>
              <p className="text-slate-600">Mentors, Admins, and Students</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Admins */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Administrators ({admins.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {admins.map(renderContactCard)}
            </div>
          </div>

          {/* Mentors */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Mentors ({mentors.length})
            </h2>
            {mentors.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-slate-600">No mentors yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mentors.map(renderContactCard)}
              </div>
            )}
          </div>

          {/* Students */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Students ({students.length})
            </h2>
            {students.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-slate-600">No students yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map(renderContactCard)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}