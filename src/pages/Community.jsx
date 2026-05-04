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
import { 
  Award, Plus, Heart, MessageCircle, Sparkles,
  Lightbulb, Star, BookOpen, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const categoryIcons = {
  breakthrough_moment: Star,
  best_practice: Lightbulb,
  tip: Sparkles,
  reflection: BookOpen
};

const categoryColors = {
  breakthrough_moment: 'bg-amber-100 text-amber-700',
  best_practice: 'bg-emerald-100 text-emerald-700',
  tip: 'bg-blue-100 text-blue-700',
  reflection: 'bg-purple-100 text-purple-700'
};

const categoryLabels = {
  breakthrough_moment: 'Breakthrough Moment',
  best_practice: 'Best Practice',
  tip: 'Quick Tip',
  reflection: 'Reflection'
};

export default function Community() {
  const [user, setUser] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newStory, setNewStory] = useState({
    title: '',
    content: '',
    category: 'tip',
    skill_tags: []
  });
  const [tagInput, setTagInput] = useState('');

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

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['stories'],
    queryFn: () => base44.entities.SuccessStory.filter(
      { approved: true },
      '-created_date',
      50
    ),
  });

  const addStoryMutation = useMutation({
    mutationFn: (data) => base44.entities.SuccessStory.create({
      ...data,
      author_name: user?.full_name || 'Anonymous Mentor',
      approved: true // Auto-approve for now
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      setIsAddDialogOpen(false);
      setNewStory({ title: '', content: '', category: 'tip', skill_tags: [] });
      setTagInput('');
    },
  });

  const filteredStories = filter === 'all' 
    ? stories 
    : stories.filter(s => s.category === filter);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!newStory.skill_tags.includes(tagInput.trim())) {
        setNewStory({
          ...newStory,
          skill_tags: [...newStory.skill_tags, tagInput.trim()]
        });
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setNewStory({
      ...newStory,
      skill_tags: newStory.skill_tags.filter(t => t !== tag)
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Community</h1>
                <p className="text-slate-600">Share tips, success stories, and best practices</p>
              </div>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <Plus className="w-4 h-4" /> Share Story
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Share with the Community</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Category</Label>
                    <Select 
                      value={newStory.category}
                      onValueChange={(v) => setNewStory({...newStory, category: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input 
                      value={newStory.title}
                      onChange={(e) => setNewStory({...newStory, title: e.target.value})}
                      placeholder="Give your story a title"
                    />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea 
                      value={newStory.content}
                      onChange={(e) => setNewStory({...newStory, content: e.target.value})}
                      placeholder="Share your experience, tip, or insight..."
                      className="min-h-[150px]"
                    />
                  </div>
                  <div>
                    <Label>Tags (press Enter to add)</Label>
                    <Input 
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="e.g., confidence, public speaking"
                    />
                    {newStory.skill_tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {newStory.skill_tags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="cursor-pointer"
                            onClick={() => removeTag(tag)}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => addStoryMutation.mutate(newStory)}
                    disabled={!newStory.title || !newStory.content || addStoryMutation.isPending}
                  >
                    {addStoryMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Share Story
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-blue-600' : ''}
          >
            All Stories
          </Button>
          {Object.entries(categoryLabels).map(([key, label]) => {
            const Icon = categoryIcons[key];
            return (
              <Button
                key={key}
                variant={filter === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(key)}
                className={filter === key ? 'bg-blue-600' : ''}
              >
                <Icon className="w-4 h-4 mr-1" />
                {label}
              </Button>
            );
          })}
        </div>

        {/* Stories Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-48 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredStories.length === 0 ? (
          <Card className="border-0">
            <CardContent className="p-12 text-center">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No stories yet</p>
              <p className="text-sm text-slate-400 mt-1">Be the first to share!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredStories.map((story, i) => {
                const Icon = categoryIcons[story.category] || Sparkles;
                
                return (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="border-0 bg-white h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryColors[story.category]}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Badge className={`mb-2 ${categoryColors[story.category]}`}>
                              {categoryLabels[story.category]}
                            </Badge>
                            <h3 className="font-semibold text-slate-900 text-lg">{story.title}</h3>
                          </div>
                        </div>
                        
                        <p className="text-slate-600 mb-4 line-clamp-4 whitespace-pre-wrap">
                          {story.content}
                        </p>
                        
                        {story.skill_tags?.length > 0 && (
                          <div className="flex gap-1 flex-wrap mb-4">
                            {story.skill_tags.map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-slate-100 text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                              {story.author_name?.charAt(0) || '?'}
                            </div>
                            <span className="text-sm text-slate-600">{story.author_name}</span>
                          </div>
                          <span className="text-xs text-slate-400">
                            {format(new Date(story.created_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}