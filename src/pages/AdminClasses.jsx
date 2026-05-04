import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Users, Calendar, Edit, Archive, 
  UserPlus, Loader2, CheckCircle2, XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdminClasses() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [newClass, setNewClass] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'draft'
  });

  const queryClient = useQueryClient();

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => base44.entities.Class.list('-created_date', 100),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
  });

  const createClassMutation = useMutation({
    mutationFn: (data) => base44.entities.Class.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setIsCreateDialogOpen(false);
      setNewClass({ name: '', description: '', start_date: '', end_date: '', status: 'draft' });
    },
  });

  const updateClassMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Class.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setEditingClass(null);
    },
  });

  const handleCreateClass = () => {
    if (!newClass.name) return;
    createClassMutation.mutate(newClass);
  };

  const mentors = allUsers.filter(u => u.role === 'mentor');
  const students = allUsers.filter(u => u.role === 'student');

  const statusColors = {
    active: 'bg-emerald-100 text-emerald-700',
    draft: 'bg-slate-100 text-slate-700',
    archived: 'bg-amber-100 text-amber-700'
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Class Management</h1>
            <p className="text-slate-600 mt-1">Create and manage classes, assign mentors and students</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                <Plus className="w-4 h-4" /> Create Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Class</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Class Name*</Label>
                  <Input
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                    placeholder="e.g., Spring 2026 Speaking Skills"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newClass.description}
                    onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                    placeholder="Brief description of the class..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={newClass.start_date}
                      onChange={(e) => setNewClass({ ...newClass, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={newClass.end_date}
                      onChange={(e) => setNewClass({ ...newClass, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={newClass.status} onValueChange={(value) => setNewClass({ ...newClass, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleCreateClass}
                  disabled={createClassMutation.isPending || !newClass.name}
                >
                  {createClassMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Create Class
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : classes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">No classes created yet</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create Your First Class
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {classes.map((classItem) => (
              <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{classItem.name}</CardTitle>
                        <Badge className={statusColors[classItem.status]}>
                          {classItem.status}
                        </Badge>
                      </div>
                      {classItem.description && (
                        <p className="text-slate-600 text-sm">{classItem.description}</p>
                      )}
                    </div>
                    <Link to={createPageUrl('AdminClassDetail') + '?id=' + classItem.id}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="w-4 h-4" /> Manage
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-slate-500">Mentors</p>
                        <p className="font-semibold text-slate-900">
                          {classItem.mentor_emails?.length || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                      <UserPlus className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-xs text-slate-500">Students</p>
                        <p className="font-semibold text-slate-900">
                          {classItem.student_emails?.length || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-xs text-slate-500">Duration</p>
                        <p className="font-semibold text-slate-900 text-sm">
                          {classItem.start_date ? new Date(classItem.start_date).toLocaleDateString() : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}