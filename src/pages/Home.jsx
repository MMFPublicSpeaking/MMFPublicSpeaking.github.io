import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowRight, Mic, Briefcase, Heart, Star, 
  Users, TrendingUp, ShieldCheck, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const benefits = [
  {
    icon: Mic,
    title: "Find Your Voice",
    description: "Build the confidence to speak up in any room — from classrooms to boardrooms.",
    color: "bg-rose-100 text-rose-600"
  },
  {
    icon: Briefcase,
    title: "Professional Skills",
    description: "Learn communication skills that employers and colleges are looking for.",
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: Heart,
    title: "1-on-1 Mentorship",
    description: "Get paired with a dedicated mentor who believes in your potential.",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: TrendingUp,
    title: "Track Your Growth",
    description: "See how far you've come with structured milestones and personal feedback.",
    color: "bg-emerald-100 text-emerald-600"
  },
  {
    icon: Users,
    title: "Supportive Community",
    description: "You're not alone — join a network of young people on the same journey.",
    color: "bg-amber-100 text-amber-600"
  },
  {
    icon: ShieldCheck,
    title: "Safe Space to Grow",
    description: "Practice, stumble, and grow in a judgment-free environment built just for you.",
    color: "bg-cyan-100 text-cyan-600"
  }
];

const testimonials = [
  {
    quote: "Before MMF I was terrified to raise my hand in class. Now I'm leading presentations. This program changed everything for me.",
    name: "Aaliyah T.",
    detail: "Program Graduate"
  },
  {
    quote: "I never knew I had so much to say until someone actually took the time to listen. My mentor helped me find my confidence.",
    name: "Marcus J.",
    detail: "Current Participant"
  },
  {
    quote: "The skills I learned here helped me land my internship. I walked into that interview knowing I could hold my own.",
    name: "Destiny R.",
    detail: "Program Graduate"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">

      {/* Nav Bar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <span className="text-white font-bold text-base">M</span>
            </div>
            <span className="font-semibold text-slate-900">Meet My Friend Within</span>
          </div>
          <Link to={createPageUrl('PortalSelect')}>
            <Button variant="outline" className="gap-2">
              Sign In <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 pt-24 pb-40">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1920')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/60" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-blue-200 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              Manaloni Manishi Foundation
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              Your Voice
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Deserves to Be Heard.
              </span>
            </h1>

            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              MMF connects young people with mentors who help them build real communication 
              skills, lasting confidence, and a brighter future — for free.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('PortalSelect')}>
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 gap-2 text-lg px-10 h-14 rounded-xl">
                  Apply for the Program <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-10 h-14 rounded-xl">
                  Learn More
                </Button>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L60 70C120 60 240 40 360 30C480 20 600 20 720 25C840 30 960 40 1080 45C1200 50 1320 50 1380 50L1440 50V80H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { number: "100+", label: "Students Served" },
              { number: "95%", label: "Feel More Confident" },
              { number: "Free", label: "Always & Forever" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <p className="text-4xl font-bold text-blue-600 mb-1">{stat.number}</p>
                <p className="text-slate-600 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">What You'll Gain</h2>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              Everything you need to grow into the best version of yourself — guided by someone who genuinely cares.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="p-6 h-full border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
                  <div className={`w-12 h-12 rounded-xl ${b.color} flex items-center justify-center mb-4`}>
                    <b.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-2">{b.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{b.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Hear From Students Like You</h2>
            <p className="text-slate-600 text-lg">Real stories from real people who took the first step.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="p-6 border-0 shadow-sm bg-slate-50 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, s) => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.detail}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Find Your Voice?
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            The program is free, the community is real, and your mentor is waiting. 
            Take the first step today.
          </p>
          <Link to={createPageUrl('PortalSelect')}>
            <Button size="lg" className="bg-white text-blue-700 hover:bg-slate-100 gap-2 px-10 h-14 text-lg rounded-xl font-semibold">
              Join the Program <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-slate-300 text-sm">Manaloni Manishi Foundation</span>
          </div>
          <p className="text-sm">© 2026 Meet My Friend Within. All rights reserved.</p>
          <Link to={createPageUrl('PortalSelect')}>
            <Button variant="ghost" className="text-slate-400 hover:text-white text-sm gap-1">
              Staff Sign In <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}