import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Calendar, Loader2, ArrowLeft, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function StudentProgress() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('StudentProgress'));
      }
    };
    loadUser();
  }, []);

  const { data: progressEntries = [], isLoading } = useQuery({
    queryKey: ['student-progress', user?.email],
    queryFn: async () => {
      const all = await base44.entities.ProgressEntry.list('-session_date', 200);
      return all.filter(p => p.mentee_id === user?.email && p.published === true);
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

  const averageRating = progressEntries.length > 0
    ? (progressEntries.reduce((sum, e) => sum + (e.confidence_rating || 0), 0) / progressEntries.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={createPageUrl('StudentDashboard')}>
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Progress</h1>
              <p className="text-slate-600">Track your development and growth</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Total Sessions</p>
                    <p className="text-3xl font-bold">{progressEntries.length}</p>
                  </div>
                  <Calendar className="w-10 h-10 text-purple-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm">Avg. Confidence</p>
                    <p className="text-3xl font-bold">{averageRating}/5</p>
                  </div>
                  <Star className="w-10 h-10 text-amber-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress Entries */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">Progress Notes</h2>
          
          {progressEntries.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No progress notes yet</p>
                <p className="text-slate-500 text-sm mt-2">Your mentor will share feedback as you progress</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {progressEntries.map((entry) => (
                <Card key={entry.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-slate-400" />
                        <CardTitle className="text-lg">
                          {new Date(entry.session_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </CardTitle>
                      </div>
                      <Badge className="bg-purple-100 text-purple-700">
                        <Star className="w-3 h-3 mr-1" />
                        {entry.confidence_rating}/5
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {entry.strengths_observed && (
                      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <p className="font-medium text-emerald-900 mb-2 flex items-center gap-2">
                          <span className="text-emerald-600">✓</span> Your Strengths
                        </p>
                        <p className="text-slate-700">{entry.strengths_observed}</p>
                      </div>
                    )}
                    
                    {entry.areas_for_growth && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          Areas to Develop
                        </p>
                        <p className="text-slate-700">{entry.areas_for_growth}</p>
                      </div>
                    )}
                    
                    {entry.next_steps && (
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                          <span className="text-amber-600">→</span> Next Steps
                        </p>
                        <p className="text-slate-700">{entry.next_steps}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}