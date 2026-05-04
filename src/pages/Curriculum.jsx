import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, ChevronRight, Clock, Target, MessageCircle,
  Play, CheckCircle2, Mic, Briefcase, Network, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const skillIcons = {
  public_speaking: Mic,
  professional_communication: Briefcase,
  networking: Network,
  confidence_building: Shield,
  feedback_skills: MessageCircle
};

const skillColors = {
  public_speaking: "bg-rose-100 text-rose-700",
  professional_communication: "bg-blue-100 text-blue-700",
  networking: "bg-emerald-100 text-emerald-700",
  confidence_building: "bg-purple-100 text-purple-700",
  feedback_skills: "bg-amber-100 text-amber-700"
};

export default function Curriculum() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialWeek = urlParams.get('week');
  
  const [selectedModule, setSelectedModule] = useState(null);
  const [filter, setFilter] = useState('all');

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ['modules'],
    queryFn: () => base44.entities.Module.filter({ status: 'published' }, 'week_number', 50),
  });

  React.useEffect(() => {
    if (initialWeek && modules.length > 0) {
      const targetModule = modules.find(m => m.week_number === parseInt(initialWeek));
      if (targetModule) setSelectedModule(targetModule);
    }
  }, [initialWeek, modules]);

  const filteredModules = filter === 'all' 
    ? modules 
    : modules.filter(m => m.skill_focus === filter);

  const skillFilters = [
    { value: 'all', label: 'All Modules' },
    { value: 'public_speaking', label: 'Public Speaking' },
    { value: 'professional_communication', label: 'Communication' },
    { value: 'networking', label: 'Networking' },
    { value: 'confidence_building', label: 'Confidence' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Curriculum</h1>
              <p className="text-slate-600">Weekly modules for speaking skill development</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {skillFilters.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.value)}
              className={filter === f.value ? "bg-blue-600" : ""}
            >
              {f.label}
            </Button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Module List */}
          <div className="lg:col-span-1 space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredModules.length === 0 ? (
              <Card className="border-0">
                <CardContent className="p-8 text-center">
                  <p className="text-slate-500">No modules found for this filter</p>
                </CardContent>
              </Card>
            ) : (
              filteredModules.map((module, i) => {
                const SkillIcon = skillIcons[module.skill_focus] || BookOpen;
                const isSelected = selectedModule?.id === module.id;
                
                return (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-200 border-0 ${
                        isSelected 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:shadow-md bg-white'
                      }`}
                      onClick={() => setSelectedModule(module)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <span className="font-bold text-sm">{module.week_number}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 truncate">{module.title}</h3>
                            {module.skill_focus && (
                              <Badge variant="secondary" className={`mt-1 text-xs ${skillColors[module.skill_focus]}`}>
                                <SkillIcon className="w-3 h-3 mr-1" />
                                {module.skill_focus?.replace(/_/g, ' ')}
                              </Badge>
                            )}
                          </div>
                          <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-transform ${
                            isSelected ? 'text-blue-600 rotate-90' : 'text-slate-400'
                          }`} />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Module Detail */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedModule ? (
                <motion.div
                  key={selectedModule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="border-0 bg-white">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <Badge variant="secondary" className="bg-slate-100">
                          Week {selectedModule.week_number}
                        </Badge>
                        {selectedModule.skill_focus && (
                          <Badge className={skillColors[selectedModule.skill_focus]}>
                            {selectedModule.skill_focus?.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-2xl">{selectedModule.title}</CardTitle>
                      <p className="text-slate-600 mt-2">{selectedModule.description}</p>
                    </CardHeader>
                    
                    <CardContent>
                      <Tabs defaultValue="objectives" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                          <TabsTrigger value="objectives">Objectives</TabsTrigger>
                          <TabsTrigger value="discussion">Discussion</TabsTrigger>
                          <TabsTrigger value="activities">Activities</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="objectives" className="space-y-4">
                          <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <Target className="w-5 h-5 text-blue-600" />
                            Learning Objectives
                          </div>
                          {selectedModule.learning_objectives?.length > 0 ? (
                            <ul className="space-y-3">
                              {selectedModule.learning_objectives.map((obj, i) => (
                                <li key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-slate-700">{obj}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-slate-500 italic">No learning objectives specified</p>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="discussion" className="space-y-4">
                          <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <MessageCircle className="w-5 h-5 text-purple-600" />
                            Discussion Prompts
                          </div>
                          {selectedModule.discussion_prompts?.length > 0 ? (
                            <ul className="space-y-3">
                              {selectedModule.discussion_prompts.map((prompt, i) => (
                                <li key={i} className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                                  <p className="text-slate-700">{prompt}</p>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-slate-500 italic">No discussion prompts specified</p>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="activities" className="space-y-4">
                          <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <Play className="w-5 h-5 text-emerald-600" />
                            Activities
                          </div>
                          {selectedModule.activities?.length > 0 ? (
                            <div className="space-y-4">
                              {selectedModule.activities.map((activity, i) => (
                                <Card key={i} className="border border-slate-200">
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <h4 className="font-semibold text-slate-900">{activity.name}</h4>
                                      {activity.duration && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {activity.duration}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-slate-600 text-sm whitespace-pre-wrap">{activity.instructions}</p>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-500 italic">No activities specified</p>
                          )}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Card className="border-0 bg-white">
                    <CardContent className="p-12 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">Select a Module</h3>
                      <p className="text-slate-500">
                        Choose a module from the list to view its content, discussion prompts, and activities.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}