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
import { Plus, Loader2, BookOpen, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdminCurriculums() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCurriculum, setNewCurriculum] = useState({
    name: '',
    description: '',
    age_group: 'high_school',
    delivery_mode: 'in_person',
    weeks: 8,
    status: 'draft'
  });

  const queryClient = useQueryClient();

  const { data: curriculums = [], isLoading } = useQuery({
    queryKey: ['curriculums'],
    queryFn: () => base44.entities.Curriculum.list('-created_date', 100),
  });

  const createCurriculumMutation = useMutation({
    mutationFn: (data) => base44.entities.Curriculum.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculums'] });
      setIsCreateDialogOpen(false);
      setNewCurriculum({
        name: '',
        description: '',
        age_group: 'high_school',
        delivery_mode: 'in_person',
        weeks: 8,
        status: 'draft'
      });
    },
  });

  const handleCreateCurriculum = () => {
    if (!newCurriculum.name) return;
    createCurriculumMutation.mutate(newCurriculum);
  };

  const statusColors = {
    published: 'bg-emerald-100 text-emerald-700',
    draft: 'bg-slate-100 text-slate-700',
    archived: 'bg-amber-100 text-amber-700'
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Curriculum Management</h1>
            <p className="text-slate-600 mt-1">Create and manage curriculums for different age groups and formats</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                <Plus className="w-4 h-4" /> Create Curriculum
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Curriculum</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Curriculum Name*</Label>
                  <Input
                    value={newCurriculum.name}
                    onChange={(e) => setNewCurriculum({ ...newCurriculum, name: e.target.value })}
                    placeholder="e.g., High School Speaking Skills - In Person"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newCurriculum.description}
                    onChange={(e) => setNewCurriculum({ ...newCurriculum, description: e.target.value })}
                    placeholder="Brief description..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Age Group*</Label>
                    <Select value={newCurriculum.age_group} onValueChange={(value) => setNewCurriculum({ ...newCurriculum, age_group: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="elementary">Elementary</SelectItem>
                        <SelectItem value="middle_school">Middle School</SelectItem>
                        <SelectItem value="high_school">High School</SelectItem>
                        <SelectItem value="adult">Adult</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Delivery Mode*</Label>
                    <Select value={newCurriculum.delivery_mode} onValueChange={(value) => setNewCurriculum({ ...newCurriculum, delivery_mode: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_person">In Person</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Number of Weeks</Label>
                  <Input
                    type="number"
                    value={newCurriculum.weeks}
                    onChange={(e) => setNewCurriculum({ ...newCurriculum, weeks: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleCreateCurriculum}
                  disabled={createCurriculumMutation.isPending || !newCurriculum.name}
                >
                  {createCurriculumMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Create Curriculum
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : curriculums.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">No curriculums created yet</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create Your First Curriculum
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {curriculums.map((curriculum) => (
              <Card key={curriculum.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{curriculum.name}</CardTitle>
                        <Badge className={statusColors[curriculum.status]}>
                          {curriculum.status}
                        </Badge>
                      </div>
                      {curriculum.description && (
                        <p className="text-slate-600 text-sm">{curriculum.description}</p>
                      )}
                    </div>
                    <Link to={createPageUrl('AdminCurriculumDetail') + '?id=' + curriculum.id}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="w-4 h-4" /> Edit
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Badge variant="outline">{curriculum.age_group?.replace('_', ' ')}</Badge>
                    <Badge variant="outline">{curriculum.delivery_mode?.replace('_', ' ')}</Badge>
                    <Badge variant="outline">{curriculum.weeks} weeks</Badge>
                    {curriculum.modules && (
                      <Badge variant="outline">{curriculum.modules.length} modules</Badge>
                    )}
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