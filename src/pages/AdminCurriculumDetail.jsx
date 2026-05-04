import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Loader2, Plus, Edit, Trash2, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdminCurriculumDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const curriculumId = urlParams.get('id');
  const [editingModule, setEditingModule] = useState(null);
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [newModule, setNewModule] = useState({
    week: 1,
    title: '',
    objectives: [''],
    content: '',
    assignments: []
  });
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    type: 'assignment',
    points: 100,
    submission_type: 'text'
  });

  const queryClient = useQueryClient();

  const { data: curriculum, isLoading } = useQuery({
    queryKey: ['curriculum', curriculumId],
    queryFn: async () => {
      const curricula = await base44.entities.Curriculum.filter({ id: curriculumId });
      return curricula[0];
    },
    enabled: !!curriculumId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Curriculum.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculum', curriculumId] });
    },
  });

  const handleAddModule = () => {
    const modules = curriculum.modules || [];
    const updatedModules = [...modules, newModule];
    updateMutation.mutate({
      id: curriculumId,
      data: { modules: updatedModules }
    });
    setIsAddModuleOpen(false);
    setNewModule({
      week: (modules.length || 0) + 1,
      title: '',
      objectives: [''],
      content: '',
      assignments: []
    });
  };

  const handleAddAssignment = () => {
    const modules = [...(curriculum.modules || [])];
    const moduleIndex = modules.findIndex(m => m.week === selectedWeek);
    if (moduleIndex === -1) return;

    const module = modules[moduleIndex];
    module.assignments = [...(module.assignments || []), newAssignment];
    
    updateMutation.mutate({
      id: curriculumId,
      data: { modules }
    });
    setIsAddAssignmentOpen(false);
    setNewAssignment({
      title: '',
      description: '',
      type: 'assignment',
      points: 100,
      submission_type: 'text'
    });
  };

  const handleDeleteModule = (week) => {
    const modules = (curriculum.modules || []).filter(m => m.week !== week);
    updateMutation.mutate({
      id: curriculumId,
      data: { modules }
    });
  };

  const handleDeleteAssignment = (week, assignmentIndex) => {
    const modules = [...(curriculum.modules || [])];
    const moduleIndex = modules.findIndex(m => m.week === week);
    if (moduleIndex === -1) return;

    modules[moduleIndex].assignments = modules[moduleIndex].assignments.filter((_, i) => i !== assignmentIndex);
    
    updateMutation.mutate({
      id: curriculumId,
      data: { modules }
    });
  };

  const handlePublish = () => {
    updateMutation.mutate({
      id: curriculumId,
      data: { status: 'published' }
    });
  };

  const handleUnpublish = () => {
    updateMutation.mutate({
      id: curriculumId,
      data: { status: 'draft' }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!curriculum) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p>Curriculum not found</p>
      </div>
    );
  }

  const modules = curriculum.modules || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={createPageUrl('AdminCurriculums')}>
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Curriculums
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">{curriculum.name}</h1>
              <Badge className={curriculum.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                {curriculum.status}
              </Badge>
            </div>
            <p className="text-slate-600">{curriculum.description}</p>
          </div>
          <div className="flex gap-2">
            {curriculum.status === 'draft' ? (
              <Button onClick={handlePublish} className="bg-emerald-600 hover:bg-emerald-700">
                Publish
              </Button>
            ) : (
              <Button onClick={handleUnpublish} variant="outline">
                Unpublish
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-8">
          <Badge variant="outline">{curriculum.age_group?.replace('_', ' ')}</Badge>
          <Badge variant="outline">{curriculum.delivery_mode?.replace('_', ' ')}</Badge>
          <Badge variant="outline">{curriculum.weeks} weeks</Badge>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">Weekly Modules</h2>
          <Dialog open={isAddModuleOpen} onOpenChange={setIsAddModuleOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                <Plus className="w-4 h-4" /> Add Module
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Add New Module</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Week Number*</Label>
                    <Input
                      type="number"
                      value={newModule.week}
                      onChange={(e) => setNewModule({ ...newModule, week: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Module Title*</Label>
                    <Input
                      value={newModule.title}
                      onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                      placeholder="e.g., Introduction to Public Speaking"
                    />
                  </div>
                </div>
                <div>
                  <Label>Learning Objectives</Label>
                  {newModule.objectives.map((obj, i) => (
                    <Input
                      key={i}
                      value={obj}
                      onChange={(e) => {
                        const updated = [...newModule.objectives];
                        updated[i] = e.target.value;
                        setNewModule({ ...newModule, objectives: updated });
                      }}
                      placeholder="Learning objective..."
                      className="mb-2"
                    />
                  ))}
                  <Button size="sm" variant="outline" onClick={() => setNewModule({ ...newModule, objectives: [...newModule.objectives, ''] })}>
                    + Add Objective
                  </Button>
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={newModule.content}
                    onChange={(e) => setNewModule({ ...newModule, content: e.target.value })}
                    placeholder="Module content and description..."
                    rows={5}
                  />
                </div>
                <Button className="w-full" onClick={handleAddModule} disabled={!newModule.title}>
                  Add Module
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {modules.sort((a, b) => a.week - b.week).map((module) => (
            <Card key={module.week}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-indigo-100 text-indigo-700">Week {module.week}</Badge>
                      <CardTitle className="text-xl">{module.title}</CardTitle>
                    </div>
                    {module.content && (
                      <p className="text-slate-600 text-sm whitespace-pre-wrap">{module.content}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteModule(module.week)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {module.objectives && module.objectives.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm text-slate-700 mb-2">Learning Objectives:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {module.objectives.filter(obj => obj).map((objective, i) => (
                        <li key={i} className="text-sm text-slate-600">{objective}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm text-slate-700">
                    Assignments ({module.assignments?.length || 0})
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedWeek(module.week);
                      setIsAddAssignmentOpen(true);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Assignment
                  </Button>
                </div>

                {module.assignments && module.assignments.length > 0 && (
                  <div className="space-y-2">
                    {module.assignments.map((assignment, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{assignment.title}</p>
                            <Badge variant="outline" className="text-xs">
                              {assignment.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {assignment.points} pts
                            </Badge>
                          </div>
                          {assignment.description && (
                            <p className="text-xs text-slate-600">{assignment.description}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAssignment(module.week, i)}
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Assignment Dialog */}
        <Dialog open={isAddAssignmentOpen} onOpenChange={setIsAddAssignmentOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Assignment to Week {selectedWeek}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Title*</Label>
                <Input
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  placeholder="Assignment title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  placeholder="Assignment instructions..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={newAssignment.type} onValueChange={(value) => setNewAssignment({ ...newAssignment, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="discussion">Discussion</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Points</Label>
                  <Input
                    type="number"
                    value={newAssignment.points}
                    onChange={(e) => setNewAssignment({ ...newAssignment, points: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Submission Type</Label>
                  <Select value={newAssignment.submission_type} onValueChange={(value) => setNewAssignment({ ...newAssignment, submission_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="file">File</SelectItem>
                      <SelectItem value="video_link">Video Link</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                className="w-full"
                onClick={handleAddAssignment}
                disabled={!newAssignment.title}
              >
                Add Assignment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}