import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Calendar as CalendarIcon, 
  ArrowRight, 
  CheckCircle2, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Download, 
  RotateCw, 
  BarChart3, 
  Zap, 
  ShieldCheck, 
  Layers,
  ChevronRight,
  Play,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ThumbsUp,
  Repeat2,
  Send,
  MousePointerClick
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activePlatformTab, setActivePlatformTab] = useState('Instagram');

  const previews = {
    Instagram: {
      platform: 'Instagram',
      tag: 'Instagram Feed Post • Carousel',
      title: '5-Minute Morning Reset Habit',
      content: `Stop checking your emails before your feet touch the floor. 🧘‍♀️✨\n\nHere's a 3-step morning ritual that will transform your focus today:\n1. 60 seconds of box breathing (in 4, hold 4, out 4)\n2. A glass of lukewarm water with lemon\n3. 3 quick gratitude bullets written on paper\n\nSmall mindful pauses compound into massive peace of mind. Have you taken your first deep breath today? 🌿`,
      hashtags: '#MorningRoutine #MindfulLiving #WellnessJourney #SelfCare',
      metric: '8.4% predicted engagement rate',
      visualPrompt: 'Minimalist serene morning coffee cup with soft sunlight streaming through a window.',
    },
    LinkedIn: {
      platform: 'LinkedIn',
      tag: 'LinkedIn Thought Leadership • Article',
      title: 'The Hidden ROI of Corporate Wellness Programs',
      content: `Burnout isn't a badge of honor. It's an executive balance sheet leak.\n\nOver the past 6 months, our team tracked 14 tech firms before and after introducing 15-minute guided mindfulness breaks:\n\n• 28% drop in reported afternoon fatigue\n• 19% reduction in unplanned sick leaves\n• 4.2x higher peer-to-peer appreciation notes\n\nSustainable performance is an energy management problem, not a time problem.`,
      hashtags: '#Leadership #WorkplaceWellness #CompanyCulture #Productivity',
      metric: '7.1% predicted engagement rate',
      visualPrompt: 'Modern glass-walled executive office with team engaging in a focused standup meeting.',
    },
    'X/Twitter': {
      platform: 'X/Twitter',
      tag: 'X (Twitter) • Snappy Hook',
      title: 'Hot Take on Hustle Culture',
      content: `Unpopular opinion: If your business model requires you to work 16 hours a day for 5 years straight, you didn't build an asset.\n\nYou built a grueling job where the boss never lets you sleep.\n\nOptimize for leverage, clarity, and rest. 🧘‍♂️⚡`,
      hashtags: '#Founders #BuildInPublic #Productivity',
      metric: '6.2% predicted engagement rate (182 / 280 chars)',
      visualPrompt: 'Dark mode code editor with clean architectural blueprint overlay.',
    },
  };

  const currentPreview = previews[activePlatformTab];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Dynamic Background Glow Blobs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-screen pointer-events-none -z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[140px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[10%] left-[20%] w-[450px] h-[450px] bg-pink-600/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-lg shadow-indigo-500/20">
              <img src="/logo.png" alt="PostWise-AI" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-white">
              PostWise<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">.ai</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-extrabold text-slate-300">
            <a href="#demo" className="hover:text-indigo-400 transition-colors">Cross-Platform AI Engine</a>
            <a href="#features" className="hover:text-indigo-400 transition-colors">Core Features</a>
            <a href="#roadmap" className="hover:text-indigo-400 transition-colors">30-Day Workflow</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-bold text-slate-300 hover:text-white px-3.5 py-2 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95 cursor-pointer border border-indigo-400/30"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Launch App</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 z-10 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 text-xs font-extrabold mb-8 shadow-xl backdrop-blur-md animate-fade-in">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>AI Social Media Calendar Generator • Hackathon Showcase 2026</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
            Generate 30 Days of Custom Social Media Posts in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              One Click.
            </span>
          </h1>

          <p className="mt-7 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Never run out of social content again. Define your brand profile once, and PostWise-AI automatically structures 30 ready-to-publish posts for Instagram, LinkedIn, and X with custom hooks, captions, visual prompts, and drag-and-drop calendar control.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-extrabold shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer border border-indigo-400/40"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate 30-Day Content Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2.5 px-7 py-4 rounded-2xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800/80 text-slate-200 text-sm font-extrabold backdrop-blur-md transition-all cursor-pointer"
            >
              <MousePointerClick className="w-4 h-4 text-indigo-400" />
              <span>Try Demo Workspace</span>
            </button>
          </div>

          {/* Feature Highlights */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-2 bg-slate-900/60 px-3.5 py-1.5 rounded-full border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Drag-and-Drop Monthly Grid
            </span>
            <span className="flex items-center gap-2 bg-slate-900/60 px-3.5 py-1.5 rounded-full border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instagram, LinkedIn & X Adaptation
            </span>
            <span className="flex items-center gap-2 bg-slate-900/60 px-3.5 py-1.5 rounded-full border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Multi-Format PDF / CSV / JSON Export
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Platform Adaptation Engine Showcase */}
      <section id="demo" className="py-20 px-6 z-10 relative bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
              Platform-Native Tone Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
              One Core Topic — 3 Unique Brand Voices
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              PostWise-AI automatically adapts your core idea into platform-native formats with specialized tone, length, and hashtag structure.
            </p>

            {/* Platform Tab Switchers */}
            <div className="inline-flex items-center gap-1.5 p-1.5 bg-slate-950/90 rounded-2xl border border-slate-800 shadow-2xl mt-8">
              <button
                onClick={() => setActivePlatformTab('Instagram')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activePlatformTab === 'Instagram'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram (Conversational & Emojis)</span>
              </button>
              <button
                onClick={() => setActivePlatformTab('LinkedIn')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activePlatformTab === 'LinkedIn'
                    ? 'bg-[#0A66C2] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn (Professional & Value)</span>
              </button>
              <button
                onClick={() => setActivePlatformTab('X/Twitter')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activePlatformTab === 'X/Twitter'
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Twitter className="w-4 h-4" />
                <span>X / Twitter (Concise & Punchy)</span>
              </button>
            </div>
          </div>

          {/* Realistic Post Feed Card Simulator */}
          <div className="bg-slate-950/90 rounded-3xl border border-slate-800/90 shadow-2xl p-6 sm:p-8 max-w-2xl mx-auto transition-all animate-scale-in">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
              <span className="text-xs font-extrabold text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-lg border border-indigo-900/60">
                {currentPreview.tag}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {currentPreview.metric}
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-white mb-3">{currentPreview.title}</h3>

            <div className="text-slate-300 whitespace-pre-line leading-relaxed text-xs sm:text-sm bg-slate-900/80 p-5 rounded-2xl border border-slate-800/80 font-normal">
              {currentPreview.content}
            </div>

            {/* AI Visual Prompt Box */}
            <div className="mt-4 p-3 rounded-xl bg-amber-950/30 border border-amber-900/40 flex items-start gap-2 text-xs text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Suggested AI Graphic / Visual:</span>
                <p className="text-amber-300/80 mt-0.5 text-[11px]">{currentPreview.visualPrompt}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-indigo-400 font-bold">{currentPreview.hashtags}</span>
              <button
                onClick={() => navigate('/calendar')}
                className="text-indigo-400 hover:text-indigo-300 font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <span>Edit in Workspace</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto z-10 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
            Full Product Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
            Built for Complete Social Media Automation
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            Every feature designed to solve real social media creation bottlenecks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-3xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-md transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-800 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">Drag-and-Drop Rescheduling</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Move posts effortlessly across the interactive 30-day monthly grid. Dropping a card onto any date automatically updates its publishing schedule in MongoDB.
            </p>
          </div>

          <div className="p-7 rounded-3xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-md transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <RotateCw className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">Single-Post Regeneration</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Don't like a specific idea? Click the quick refresh button on any card or give custom AI prompts to regenerate individual posts without disrupting the rest of your calendar.
            </p>
          </div>

          <div className="p-7 rounded-3xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-md transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">Multi-Format Roadmaps</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Export your finished 30-day calendar into printable PDF blueprints with brand colors, CSV files for auto-publish tools, or structured JSON payloads.
            </p>
          </div>

          <div className="p-7 rounded-3xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-md transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-800 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">Groq AI 120B Model Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Leverages direct API connections to ultra-fast Groq LLM infrastructure (`openai/gpt-oss-120b`) for rapid high-quality social copy generation.
            </p>
          </div>

          <div className="p-7 rounded-3xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-md transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">Predictive Engagement Insights</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Get estimated engagement rates, optimal time slot recommendations, and platform breakdown analytics for maximum reach.
            </p>
          </div>

          <div className="p-7 rounded-3xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-md transition-all hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-white mb-2">Brand Profile Persona Vault</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Configure brand tone (playful, professional, inspirational), target audience demographics, niche keywords, and custom platform handles.
            </p>
          </div>
        </div>
      </section>

      {/* Final Call To Action */}
      <section className="py-24 px-6 bg-gradient-to-b from-slate-900 to-slate-950 text-white text-center relative overflow-hidden border-t border-slate-800/80 z-10">
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to Automate Your Social Content Strategy?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-4 max-w-xl mx-auto font-normal">
            Generate 30 custom posts tailored for your brand persona in under 10 seconds.
          </p>

          <div className="mt-10 flex justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-3 px-9 py-4.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer border border-indigo-400/40"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Launch PostWise-AI Generator</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-900 text-center text-xs text-slate-500 font-medium">
        <p>PostWise-AI • Social Media Content Calendar Generator • Hackathon Submission 2026</p>
      </footer>
    </div>
  );
};

export default LandingPage;
