import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FolderOpen, Search, Download, FileText, Video, BookOpen,
  FileCode, ExternalLink, GraduationCap
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

export default function StudentResources() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedResource, setSelectedResource] = useState(null);

  const { data: studentResources = [], isLoading: loading1 } = useQuery({
    queryKey: ['student-resources'],
    queryFn: () => base44.entities.Resource.filter(
      { audience: 'student' },
      '-created_date',
      100
    ),
  });

  const { data: bothResources = [], isLoading: loading2 } = useQuery({
    queryKey: ['both-resources'],
    queryFn: () => base44.entities.Resource.filter(
      { audience: 'both' },
      '-created_date',
      100
    ),
  });

  const isLoading = loading1 || loading2;
  const allResources = [...studentResources, ...bothResources];

  const filteredResources = allResources.filter(resource => {
    const matchesSearch = !searchQuery || 
      resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = activeTab === 'all' || resource.type === activeTab;
    
    return matchesSearch && matchesType;
  });

  const resourcesByType = {
    template: filteredResources.filter(r => r.type === 'template'),
    script: filteredResources.filter(r => r.type === 'script'),
    guide: filteredResources.filter(r => r.type === 'guide'),
    worksheet: filteredResources.filter(r => r.type === 'worksheet'),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Student Resources</h1>
              <p className="text-indigo-200">Templates, scripts, and guides to support your growth</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-xl mt-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Search resources..."
              className="pl-10 bg-white text-slate-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-white border">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="template">Templates</TabsTrigger>
            <TabsTrigger value="script">Scripts</TabsTrigger>
            <TabsTrigger value="guide">Guides</TabsTrigger>
            <TabsTrigger value="worksheet">Worksheets</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Resource Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-40 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredResources.length === 0 ? (
          <Card className="border-0">
            <CardContent className="p-12 text-center">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No resources found</p>
              <p className="text-sm text-slate-400 mt-1">Try a different search term</p>
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
                          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 mb-1">{resource.title}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2">{resource.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-4">
                          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                            {resource.type}
                          </Badge>
                          {resource.file_url && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Download className="w-3 h-3" /> Download
                            </Badge>
                          )}
                        </div>
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
                    <div className="w-14 h-14 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                      {(() => {
                        const Icon = typeIcons[selectedResource.type] || FileText;
                        return <Icon className="w-7 h-7" />;
                      })()}
                    </div>
                    <div>
                      <DialogTitle className="text-xl">{selectedResource.title}</DialogTitle>
                      <Badge className="mt-2 bg-indigo-100 text-indigo-700">
                        {selectedResource.type}
                      </Badge>
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
                      className="flex items-center gap-2 p-4 bg-indigo-50 rounded-xl text-indigo-700 hover:bg-indigo-100 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      <span className="font-medium">Download Resource</span>
                      <ExternalLink className="w-4 h-4 ml-auto" />
                    </a>
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