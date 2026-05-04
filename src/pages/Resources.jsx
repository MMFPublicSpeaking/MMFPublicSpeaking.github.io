import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  FolderOpen, Search, Download, FileText, Video, BookOpen,
  FileCode, ExternalLink, Filter, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const typeIcons = {
  guide: BookOpen,
  worksheet: FileText,
  template: FileCode,
  video: Video,
  article: FileText,
  script: FileCode
};

const categoryLabels = {
  mentor_training: 'Mentor Training',
  student_resources: 'Student Resources',
  conversation_starters: 'Conversation Starters',
  feedback_tools: 'Feedback Tools',
  best_practices: 'Best Practices'
};

const categoryColors = {
  mentor_training: 'bg-blue-100 text-blue-700',
  student_resources: 'bg-emerald-100 text-emerald-700',
  conversation_starters: 'bg-purple-100 text-purple-700',
  feedback_tools: 'bg-amber-100 text-amber-700',
  best_practices: 'bg-rose-100 text-rose-700'
};

export default function Resources() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialId = urlParams.get('id');

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedResource, setSelectedResource] = useState(null);

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: () => base44.entities.Resource.filter(
      { audience: 'mentor' },
      '-created_date',
      100
    ),
  });

  const { data: bothResources = [] } = useQuery({
    queryKey: ['resources-both'],
    queryFn: () => base44.entities.Resource.filter(
      { audience: 'both' },
      '-created_date',
      100
    ),
  });

  const allResources = [...resources, ...bothResources];

  React.useEffect(() => {
    if (initialId && allResources.length > 0) {
      const target = allResources.find(r => r.id === initialId);
      if (target) setSelectedResource(target);
    }
  }, [initialId, allResources]);

  const filteredResources = allResources.filter(resource => {
    const matchesSearch = !searchQuery || 
      resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || resource.category === categoryFilter;
    const matchesType = typeFilter === 'all' || resource.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = ['all', ...Object.keys(categoryLabels)];
  const types = ['all', 'guide', 'worksheet', 'template', 'video', 'article', 'script'];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Resource Library</h1>
              <p className="text-slate-600">Guides, templates, and training materials for mentors</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Search resources..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select 
                className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <select 
                className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                {types.slice(1).map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Filters */}
        {(categoryFilter !== 'all' || typeFilter !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-sm text-slate-500">Filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
              </Badge>
            )}
            {categoryFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {categoryLabels[categoryFilter]}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setCategoryFilter('all')} />
              </Badge>
            )}
            {typeFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {typeFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setTypeFilter('all')} />
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setSearchQuery(''); setCategoryFilter('all'); setTypeFilter('all'); }}
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Resource Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-48 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredResources.length === 0 ? (
          <Card className="border-0">
            <CardContent className="p-12 text-center">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No resources found</p>
              <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredResources.map((resource, i) => {
                const Icon = typeIcons[resource.type] || FileText;
                
                return (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card 
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white h-full"
                      onClick={() => setSelectedResource(resource)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryColors[resource.category] || 'bg-slate-100 text-slate-600'}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 mb-1">{resource.title}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2">{resource.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-4 flex-wrap">
                          <Badge variant="secondary" className={categoryColors[resource.category]}>
                            {categoryLabels[resource.category]}
                          </Badge>
                          <Badge variant="outline">{resource.type}</Badge>
                          {resource.featured && (
                            <Badge className="bg-amber-100 text-amber-700">Featured</Badge>
                          )}
                        </div>
                        
                        {resource.tags?.length > 0 && (
                          <div className="flex gap-1 mt-3 flex-wrap">
                            {resource.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="text-xs text-slate-400">#{tag}</span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Resource Detail Dialog */}
        <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedResource && (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryColors[selectedResource.category] || 'bg-slate-100'}`}>
                      {(() => {
                        const Icon = typeIcons[selectedResource.type] || FileText;
                        return <Icon className="w-7 h-7" />;
                      })()}
                    </div>
                    <div>
                      <DialogTitle className="text-xl">{selectedResource.title}</DialogTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge className={categoryColors[selectedResource.category]}>
                          {categoryLabels[selectedResource.category]}
                        </Badge>
                        <Badge variant="outline">{selectedResource.type}</Badge>
                      </div>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="mt-4 space-y-4">
                  {selectedResource.description && (
                    <p className="text-slate-600">{selectedResource.description}</p>
                  )}
                  
                  {selectedResource.content && (
                    <div className="prose prose-sm prose-slate max-w-none bg-slate-50 rounded-xl p-4">
                      <ReactMarkdown>{selectedResource.content}</ReactMarkdown>
                    </div>
                  )}
                  
                  {selectedResource.file_url && (
                    <a 
                      href={selectedResource.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-4 bg-blue-50 rounded-xl text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      <span className="font-medium">Download Resource</span>
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </a>
                  )}
                  
                  {selectedResource.tags?.length > 0 && (
                    <div className="flex gap-2 flex-wrap pt-2 border-t border-slate-100">
                      {selectedResource.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-slate-100">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}