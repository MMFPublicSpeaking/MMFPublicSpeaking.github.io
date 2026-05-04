import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, BookOpen, Target, MessageCircle, ArrowRight,
  CheckCircle2, Clock, Mic, Briefcase, Network, Sparkles, Users
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentHub() {
  const { data: modules = [] } = useQuery({
    queryKey: ['modules'],
    queryFn: () => base44.entities.Module.filter({ status: 'published' }, 'week_number', 50),
  });

  const expectations = [
    { icon: Clock, text: "Attend weekly sessions with your mentor" },
    { icon: Target, text: "Come prepared with questions and goals" },
    { icon: MessageCircle, text: "Practice speaking skills during sessions" },
    { icon: CheckCircle2, text: "Complete reflection exercises" },
    { icon: Users, text: "Engage actively in discussions" },
  ];

  const skills = [
    {
      icon: Mic,
      title: "Public Speaking",
      description: "Build confidence in presenting ideas clearly and engagingly",
      color: "bg-rose-100 text-rose-600"
    },
    {
      icon: Briefcase,
      title: "Professional Communication",
      description: "Master workplace communication and email etiquette",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Network,
      title: "Networking",
      description: "Learn to build meaningful professional connections",
      color: "bg-emerald-100 text-emerald-600"
    },
  ];

  const reflectionPrompts = [
    "What speaking situation makes me most nervous, and why?",
    "What's one communication skill I admire in others?",
    "How do I want others to perceive me when I speak?",
    "What's a recent conversation I wish had gone better?",
    "What does confidence look like to me?",
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-indigo-200 text-sm mb-6">
              <GraduationCap className="w-4 h-4" />
              Student Portal
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to Your Speaking Journey
            </h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Develop the communication skills that will set you apart in your career
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Session Expectations */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-600" />
            Session Expectations
          </h2>
          <Card className="border-0 bg-white">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expectations.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="text-slate-700">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Skills You'll Build */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            Skills You'll Build
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {skills.map((skill, i) => (
              <motion.div
                key={skill.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-0 bg-white h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-2xl ${skill.color} flex items-center justify-center mb-4`}>
                      <skill.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{skill.title}</h3>
                    <p className="text-slate-600">{skill.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Program Overview */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Program Overview
            </h2>
            <Card className="border-0 bg-white">
              <CardContent className="p-6">
                {modules.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">Loading curriculum...</p>
                ) : (
                  <div className="space-y-3">
                    {modules.slice(0, 8).map((module) => (
                      <div 
                        key={module.id}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-blue-600">{module.week_number}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{module.title}</p>
                          {module.skill_focus && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {module.skill_focus?.replace(/_/g, ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {modules.length > 8 && (
                      <p className="text-sm text-slate-500 text-center pt-2">
                        + {modules.length - 8} more weeks
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Reflection Prompts */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-purple-600" />
              Reflection Prompts
            </h2>
            <Card className="border-0 bg-white">
              <CardContent className="p-6">
                <p className="text-slate-600 mb-4">
                  Use these prompts to prepare for your sessions and track your growth:
                </p>
                <div className="space-y-3">
                  {reflectionPrompts.map((prompt, i) => (
                    <div 
                      key={i}
                      className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400"
                    >
                      <p className="text-slate-700">{prompt}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Resources CTA */}
        <section className="mt-12">
          <Card className="border-0 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Ready to Learn More?</h3>
                <p className="text-indigo-100">
                  Access templates, scripts, and skill-building resources
                </p>
              </div>
              <Link to={createPageUrl('StudentResources')}>
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-slate-100 gap-2">
                  Browse Resources <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}