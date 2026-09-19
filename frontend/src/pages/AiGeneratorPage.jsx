import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCalendar } from '../context/CalendarContext';
import { 
  Sparkles, 
  Layers, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  ArrowRight, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Loader2,
  Wand2,
  Zap
} from 'lucide-react';

const CAMPAIGN_PRESETS = [
  {
    id: 'launch',
    title: 'Product / Feature Launch Sprint',
    desc: 'Teasers, countdowns, deep-dive carousels, customer testimonials, and launch day buzz.',
    badge: 'High Conversion',
  },
  {
    id: 'thought_leadership',
    title: 'Industry Authority & Thought Leadership',
    desc: 'Data benchmarks, frameworks, lessons learned, and contrarian perspectives.',
    badge: 'B2B & Reach',
  },
  {
    id: 'community_growth',
    title: 'Community Engagement & Habits',
    desc: 'Interactive polls, relatable memes, behind-the-scenes stories, and weekly challenges.',
    badge: 'Virality',
  },
  {
    id: 'educational',
    title: 'Step-by-Step Educational Guides',
    desc: 'How-tos, checklists, myth-busting carousels, and actionable quick tips.',
    badge: 'Saves & Shares',
  },
];

const AiGeneratorPage = () => {
  const { brands, activeBrand } = useAuth();
  const { generateNewCalendar } = useCalendar();
  const navigate = useNavigate();

  const [selectedBrandId, setSelectedBrandId] = useState(
    activeBrand ? activeBrand._id : (brands && brands[0] ? brands[0]._id : '')
  );

  useEffect(() => {
    if (activeBrand?._id) {
      setSelectedBrandId(activeBrand._id);
    } else if (brands && brands.length > 0 && (!selectedBrandId || selectedBrandId === 'brand_ecoglow_1')) {
      setSelectedBrandId(brands[0]._id);
    }
  }, [activeBrand, brands]);

  const [campaignId, setCampaignId] = useState('launch');
  const [customGoal, setCustomGoal] = useState('');
  const [month, setMonth] = useState('September 2026');
  const [targetPlatforms, setTargetPlatforms] = useState(['Instagram', 'LinkedIn', 'X/Twitter']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState('');

  const togglePlatform = (p) => {
    if (targetPlatforms.includes(p)) {
      if (targetPlatforms.length > 1) {
        setTargetPlatforms(targetPlatforms.filter((item) => item !== p));
      }
    } else {
      setTargetPlatforms([...targetPlatforms, p]);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    const steps = [
      { p: 20, text: 'Analyzing brand tone of voice and niche...' },
      { p: 45, text: 'Tailoring prompts for Instagram, LinkedIn, and X...' },
      { p: 70, text: 'Generating 30 post ideas, captions, and hashtag clusters...' },
      { p: 90, text: 'Distributing optimal timeslots throughout the month...' },
      { p: 100, text: 'Finalizing calendar roadmap!' },
    ];

    for (const s of steps) {
      setProgress(s.p);
      setStageText(s.text);
      await new Promise((r) => setTimeout(r, 600));
    }

    try {
      const brand = brands.find((b) => b._id === selectedBrandId) || activeBrand || brands[0];
      const targetBrandId = brand?._id || selectedBrandId || activeBrand?._id;
      const preset = CAMPAIGN_PRESETS.find((c) => c.id === campaignId);
      await generateNewCalendar({
        brandId: targetBrandId,
        topic: customGoal || `${brand?.name || 'Brand'} - ${preset?.title || 'Strategy'}`,
        month,
        platforms: targetPlatforms,
      });

      navigate('/calendar');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-3 shadow-xs">
          <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
          One-Click AI Strategy Engine
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Generate 30 Days of Tailored Social Content
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-2">
          Turn your brand identity into a full month of ready-to-publish posts across Instagram, LinkedIn, and X with zero creative block.
        </p>
      </div>

      {/* Generation Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {!isGenerating ? (
          <form onSubmit={handleGenerate} className="flex flex-col gap-6">
            {/* 1. Target Brand */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Brand Persona
              </label>
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-xs"
              >
                {brands && brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.niche || b.industry} • Tone: {b.tone})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Campaign Objective */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Choose Campaign Pillar
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CAMPAIGN_PRESETS.map((preset) => {
                  const isSelected = campaignId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setCampaignId(preset.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-slate-900">{preset.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{preset.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Angle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                3. Custom Focus Keyword or Campaign Goal (Optional)
              </label>
              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="e.g. 3 posts per week on product launches, behind-the-scenes, and tips"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none shadow-xs"
              />
            </div>

            {/* 4. Target Platforms */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                4. Select Active Platforms
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div
                  onClick={() => togglePlatform('Instagram')}
                  className={`p-4 rounded-2xl border text-center cursor-pointer transition-all ${
                    targetPlatforms.includes('Instagram')
                      ? 'border-pink-500 bg-pink-50/50 shadow-xs'
                      : 'border-slate-200 opacity-60'
                  }`}
                >
                  <Instagram className="w-5 h-5 text-pink-600 mx-auto mb-1" />
                  <div className="text-xs font-bold text-slate-900">Instagram</div>
                  <div className="text-[10px] text-pink-600 font-semibold">Visuals & Emojis</div>
                </div>

                <div
                  onClick={() => togglePlatform('LinkedIn')}
                  className={`p-4 rounded-2xl border text-center cursor-pointer transition-all ${
                    targetPlatforms.includes('LinkedIn')
                      ? 'border-[#0A66C2] bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 opacity-60'
                  }`}
                >
                  <Linkedin className="w-5 h-5 text-[#0A66C2] mx-auto mb-1" />
                  <div className="text-xs font-bold text-slate-900">LinkedIn</div>
                  <div className="text-[10px] text-[#0A66C2] font-semibold">Insights & ROI</div>
                </div>

                <div
                  onClick={() => togglePlatform('X/Twitter')}
                  className={`p-4 rounded-2xl border text-center cursor-pointer transition-all ${
                    targetPlatforms.includes('X/Twitter')
                      ? 'border-slate-900 bg-slate-100 shadow-xs'
                      : 'border-slate-200 opacity-60'
                  }`}
                >
                  <Twitter className="w-5 h-5 text-slate-900 mx-auto mb-1" />
                  <div className="text-xs font-bold text-slate-900">X / Twitter</div>
                  <div className="text-[10px] text-slate-600 font-semibold">Concise & Punchy</div>
                </div>
              </div>
            </div>

            {/* Target Month */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  5. Calendar Month
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="September 2026">September 2026</option>
                  <option value="October 2026">October 2026</option>
                  <option value="November 2026">November 2026</option>
                  <option value="December 2026">December 2026</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Generated Volume
                </label>
                <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>30 Posts Scheduled</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                    Full Month Grid
                  </span>
                </div>
              </div>
            </div>

            {/* Generate Action */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition-all transform active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate 30-Day AI Calendar</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </form>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>

            <div className="max-w-md">
              <h3 className="text-xl font-extrabold text-slate-900">
                Generating 30 Custom Posts...
              </h3>
              <p className="text-xs text-slate-500 mt-1">{stageText}</p>
            </div>

            <div className="w-full max-w-sm bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div
                className="bg-gradient-to-r from-indigo-600 to-violet-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <span className="text-xs font-bold text-slate-500">{progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiGeneratorPage;
