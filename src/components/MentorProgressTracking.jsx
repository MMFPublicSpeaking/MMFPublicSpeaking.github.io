import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, TrendingUp, Calendar } from 'lucide-react';

export default function MentorProgressTracking({ classId, classData }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [newProgress, setNewProgress] = useState({
    session_date: new Date().toISOString().split('T')[0],
    strengths_observed: '',
    areas_for_growth: '',
    next_steps: '',
    confidence_rating: 3,
  });

  const queryClient = useQueryClient();

  const { data: progressEntries = [], isLoading } = useQuery({
    queryKey: ['progress-entries', classId],
    queryFn: async () => {
      const all = await base44.entities.ProgressEntry.list('-session_date', 200);
      // Filter by students in this class
      return all.filter(p => classData.student_emails?.includes(p.mentee_id));
    },
    enabled: !!classId && !!classData,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ProgressEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-entries'] });
      setIsAddOpen(false);
      setNewProgress({
        session_date: new Date().toISOString().split('T')[0],
        strengths_observed: '',
        areas_for_growth: '',
        next_steps: '',
        confidence_rating: 3,
      });
      setSelectedStudent('');
    },
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, published }) => base44.entities.ProgressEntry.update(id, { published }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-entries'] });
    },
  });

  const handleCreate = () => {
    if (!selectedStudent) return;
    createMutation.mutate({
      ...newProgress,
      mentee_id: selectedStudent,
      class_id: classId,
      published: false,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Student Progress Tracking</h3>
          <p className="text-sm text-slate-600">Track individual student progress and development</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <Button onClick={() => setIsAddOpen(true)} className="bg-purple-600 hover:bg-purple-700 gap-2">
            <Plus className="w-4 h-4" /> Add Progress Note
          </Button>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Progress Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Select Student*</Label>
                <select
                  className="w-full h-9 px-3 rounded-md border border-slate-200 bg-white"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  <option value="">Choose a student...</option>
                  {classData?.student_emails?.map((email) => (
                    <option key={email} value={email}>{email}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Session Date*</Label>
                <Input
                  type="date"
                  value={newProgress.session_date}
                  onChange={(e) => setNewProgress({ ...newProgress, session_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Strengths Observed</Label>
                <Textarea
                  value={newProgress.strengths_observed}
                  onChange={(e) => setNewProgress({ ...newProgress, strengths_observed: e.target.value })}
                  placeholder="What did the student do well?"
                  rows={3}
                />
              </div>
              <div>
                <Label>Areas for Growth</Label>
                <Textarea
                  value={newProgress.areas_for_growth}
                  onChange={(e) => setNewProgress({ ...newProgress, areas_for_growth: e.target.value })}
                  placeholder="What can the student improve on?"
                  rows={3}
                />
              </div>
              <div>
                <Label>Next Steps</Label>
                <Textarea
                  value={newProgress.next_steps}
                  onChange={(e) => setNewProgress({ ...newProgress, next_steps: e.target.value })}
                  placeholder="Action items for next session..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Confidence Rating (1-5)</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={newProgress.confidence_rating}
                  onChange={(e) => setNewProgress({ ...newProgress, confidence_rating: parseInt(e.target.value) })}
                />
              </div>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={handleCreate}
                disabled={!selectedStudent || createMutation.isPending}
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Add Progress Note
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </div>
      ) : progressEntries.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No progress notes yet</p>
            <p className="text-slate-500 text-sm mt-1">Add your first progress note to track student development</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {progressEntries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-slate-900">{entry.mentee_id}</p>
                    <Badge className="bg-purple-100 text-purple-700">
                      Rating: {entry.confidence_rating}/5
                    </Badge>
                    <Badge className={entry.published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                      {entry.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    {new Date(entry.session_date).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={entry.published ? 'outline' : 'default'}
                  className={entry.published ? '' : 'bg-emerald-600 hover:bg-emerald-700'}
                  onClick={() => publishMutation.mutate({ id: entry.id, published: !entry.published })}
                  disabled={publishMutation.isPending}
                >
                  {entry.published ? 'Unpublish' : 'Publish'}
                </Button>
                </div>
                <div className="space-y-3 text-sm">
                  {entry.strengths_observed && (
                    <div>
                      <p className="font-medium text-emerald-700">Strengths:</p>
                      <p className="text-slate-600">{entry.strengths_observed}</p>
                    </div>
                  )}
                  {entry.areas_for_growth && (
                    <div>
                      <p className="font-medium text-amber-700">Areas for Growth:</p>
                      <p className="text-slate-600">{entry.areas_for_growth}</p>
                    </div>
                  )}
                  {entry.next_steps && (
                    <div>
                      <p className="font-medium text-blue-700">Next Steps:</p>
                      <p className="text-slate-600">{entry.next_steps}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}