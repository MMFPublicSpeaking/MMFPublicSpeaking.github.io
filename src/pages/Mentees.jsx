import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Plus, Calendar, TrendingUp, Edit, ChevronRight,
  User, Mail, Clock, Target, CheckCircle, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function Mentees() {
  const [user, setUser] = useState(null);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [newMentee, setNewMentee] = useState({ name: '', email: '', start_date: '' });
  const [newProgress, setNewProgress] = useState({
    session_date: format(new Date(), 'yyyy-MM-dd'),
    skills_practiced: [],
    strengths_observed: '',
    areas_for_growth: '',
    next_steps: '',
    confidence_rating: 3
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        console.log('Not logged in');
      }
    };
    loadUser();
  }, []);

  const isAdmin = user?.role === 'admin';

  const { data: mentees = [], isLoading } = useQuery({
    queryKey: ['mentees', user?.email, isAdmin],
    queryFn: () => {
      if (isAdmin) {
        return base44.entities.Mentee.list('-created_date', 200);
      }
      return base44.entities.Mentee.filter(
        user?.email ? { mentor_email: user.email } : {},
        '-created_date',
        50
      );
    },
    enabled: !!user,
  });

  const { data: progressEntries = [] } = useQuery({
    queryKey: ['progress', selectedMentee?.id],
    queryFn: () => base44.entities.ProgressEntry.filter(
      { mentee_id: selectedMentee.id },
      '-session_date',
      50
    ),
    enabled: !!selectedMentee,
  });

  const addMenteeMutation = useMutation({
    mutationFn: (data) => base44.entities.Mentee.create({
      ...data,
      mentor_email: user.email,
      status: 'active',
      current_week: 1
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentees'] });
      setIsAddDialogOpen(false);
      setNewMentee({ name: '', email: '', start_date: '' });
    },
  });

  const updateMenteeMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Mentee.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentees'] });
    },
  });

  const addProgressMutation = useMutation({
    mutationFn: (data) => base44.entities.ProgressEntry.create({
      ...data,
      mentee_id: selectedMentee.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      setIsProgressDialogOpen(false);
      setNewProgress({
        session_date: format(new Date(), 'yyyy-MM-dd'),
        skills_practiced: [],
        strengths_observed: '',
        areas_for_growth: '',
        next_steps: '',
        confidence_rating: 3
      });
    },
  });

  const statusColors = {
    active: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-blue-100 text-blue-700',
    paused: 'bg-amber-100 text-amber-700'
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {isAdmin ? 'All Mentees' : 'My Mentees'}
                </h1>
                <p className="text-slate-600">
                  {isAdmin ? 'View and manage all mentees across mentors' : 'Track progress and manage your mentees'}
                </p>
              </div>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <Plus className="w-4 h-4" /> Add Mentee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Mentee</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Name</Label>
                    <Input 
                      value={newMentee.name}
                      onChange={(e) => setNewMentee({...newMentee, name: e.target.value})}
                      placeholder="Enter mentee's name"
                    />
                  </div>
                  <div>
                    <Label>Email (optional)</Label>
                    <Input 
                      type="email"
                      value={newMentee.email}
                      onChange={(e) => setNewMentee({...newMentee, email: e.target.value})}
                      placeholder="mentee@email.com"
                    />
                  </div>
                  <div>
                    <Label>Start Date</Label>
                    <Input 
                      type="date"
                      value={newMentee.start_date}
                      onChange={(e) => setNewMentee({...newMentee, start_date: e.target.value})}
                    />
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => addMenteeMutation.mutate(newMentee)}
                    disabled={!newMentee.name || addMenteeMutation.isPending}
                  >
                    {addMenteeMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Add Mentee
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mentee List */}
          <div className="lg:col-span-1 space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : mentees.length === 0 ? (
              <Card className="border-0">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No mentees yet</p>
                  <p className="text-sm text-slate-400 mt-1">Click "Add Mentee" to get started</p>
                </CardContent>
              </Card>
            ) : (
              mentees.map((mentee, i) => (
                <motion.div
                  key={mentee.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-200 border-0 ${
                      selectedMentee?.id === mentee.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-md bg-white'
                    }`}
                    onClick={() => setSelectedMentee(mentee)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                          {mentee.name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900">{mentee.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs ${statusColors[mentee.status]}`}>
                              {mentee.status}
                            </Badge>
                            <span className="text-xs text-slate-500">Week {mentee.current_week || 1}</span>
                          </div>
                          {isAdmin && mentee.mentor_email && (
                            <p className="text-xs text-slate-400 mt-1">Mentor: {mentee.mentor_email}</p>
                          )}
                        </div>
                        <ChevronRight className={`w-5 h-5 transition-transform ${
                          selectedMentee?.id === mentee.id ? 'text-blue-600 rotate-90' : 'text-slate-400'
                        }`} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* Mentee Detail */}
          <div className="lg:col-span-2">
            {selectedMentee ? (
              <motion.div
                key={selectedMentee.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-0 bg-white mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
                          {selectedMentee.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900">{selectedMentee.name}</h2>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge className={statusColors[selectedMentee.status]}>
                              {selectedMentee.status}
                            </Badge>
                            {selectedMentee.email && (
                              <span className="text-sm text-slate-500 flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {selectedMentee.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {(isAdmin || selectedMentee.mentor_email === user?.email) && (
                          <Select 
                            value={selectedMentee.status}
                            onValueChange={(value) => {
                              updateMenteeMutation.mutate({ id: selectedMentee.id, data: { status: value } });
                              setSelectedMentee({...selectedMentee, status: value});
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="paused">Paused</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" /> Current Week
                        </p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">
                          {selectedMentee.current_week || 1}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> Started
                        </p>
                        <p className="text-lg font-semibold text-slate-900 mt-1">
                          {selectedMentee.start_date 
                            ? format(new Date(selectedMentee.start_date), 'MMM d') 
                            : 'Not set'}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Target className="w-4 h-4" /> Sessions
                        </p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">
                          {progressEntries.length}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" /> Avg Confidence
                        </p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">
                          {progressEntries.length > 0 
                            ? (progressEntries.reduce((acc, p) => acc + (p.confidence_rating || 0), 0) / progressEntries.length).toFixed(1)
                            : '–'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Tracking */}
                <Card className="border-0 bg-white">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Session Progress</CardTitle>
                    {(isAdmin || selectedMentee.mentor_email === user?.email) && (
                      <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1">
                            <Plus className="w-4 h-4" /> Log Session
                          </Button>
                        </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Log Session Progress</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto">
                          <div>
                            <Label>Session Date</Label>
                            <Input 
                              type="date"
                              value={newProgress.session_date}
                              onChange={(e) => setNewProgress({...newProgress, session_date: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Confidence Rating (1-5)</Label>
                            <Select 
                              value={String(newProgress.confidence_rating)}
                              onValueChange={(v) => setNewProgress({...newProgress, confidence_rating: parseInt(v)})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1,2,3,4,5].map(n => (
                                  <SelectItem key={n} value={String(n)}>{n} - {['Needs work', 'Below average', 'Average', 'Good', 'Excellent'][n-1]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Strengths Observed</Label>
                            <Textarea 
                              value={newProgress.strengths_observed}
                              onChange={(e) => setNewProgress({...newProgress, strengths_observed: e.target.value})}
                              placeholder="What went well?"
                            />
                          </div>
                          <div>
                            <Label>Areas for Growth</Label>
                            <Textarea 
                              value={newProgress.areas_for_growth}
                              onChange={(e) => setNewProgress({...newProgress, areas_for_growth: e.target.value})}
                              placeholder="What needs improvement?"
                            />
                          </div>
                          <div>
                            <Label>Next Steps</Label>
                            <Textarea 
                              value={newProgress.next_steps}
                              onChange={(e) => setNewProgress({...newProgress, next_steps: e.target.value})}
                              placeholder="Action items for next session"
                            />
                          </div>
                          <Button 
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => addProgressMutation.mutate(newProgress)}
                            disabled={addProgressMutation.isPending}
                          >
                            {addProgressMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Save Progress
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    )}
                  </CardHeader>
                  <CardContent>
                    {progressEntries.length === 0 ? (
                      <div className="text-center py-8">
                        <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No sessions logged yet</p>
                        <p className="text-sm text-slate-400 mt-1">Click "Log Session" to track progress</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {progressEntries.map((entry) => (
                          <div key={entry.id} className="p-4 border border-slate-100 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm text-slate-500">
                                {format(new Date(entry.session_date), 'MMMM d, yyyy')}
                              </span>
                              <Badge variant="outline">
                                Confidence: {entry.confidence_rating}/5
                              </Badge>
                            </div>
                            {entry.strengths_observed && (
                              <div className="mb-2">
                                <span className="text-xs font-medium text-emerald-600">Strengths:</span>
                                <p className="text-sm text-slate-700">{entry.strengths_observed}</p>
                              </div>
                            )}
                            {entry.areas_for_growth && (
                              <div className="mb-2">
                                <span className="text-xs font-medium text-amber-600">Growth Areas:</span>
                                <p className="text-sm text-slate-700">{entry.areas_for_growth}</p>
                              </div>
                            )}
                            {entry.next_steps && (
                              <div>
                                <span className="text-xs font-medium text-blue-600">Next Steps:</span>
                                <p className="text-sm text-slate-700">{entry.next_steps}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="border-0 bg-white">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Select a Mentee</h3>
                  <p className="text-slate-500">
                    Choose a mentee from the list to view their profile and track progress.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}