import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  Layers, 
  Target, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Loader2,
  CheckCircle2,
  Zap,
  Wand2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCalendar } from '../context/CalendarContext';

const CAMPAIGN_PRESETS = [
  {
    id: 'launch',
    title: 'Product / Feature Launch Sprint',
    desc: 'Build anticipation, release teasers, feature deep-dives, and social proof.',
    color: 'from-amber-500 to-rose-500',
  },
  {
    id: 'community',
    title: 'Community & Viral Engagement',
    desc: 'Polls, discussion starters, user stories, and daily thought leadership.',
    color: 'from-indigo-500 to-cyan-500',
  },
  {
    id: 'growth',
    title: 'Educational & Authority Blueprint',
    desc: 'Actionable step-by-step guides, myth-busters, frameworks, and cheat sheets.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'holiday',
    title: 'Seasonal / Promo Blitz',
    desc: 'Festive promos, limited-time announcements, behind-the-scenes celebrations.',
    color: 'from-violet-500 to-pink-500',
  },
];

const AiGenerateModal = ({ isOpen, onClose, onGenerated }) => {
  const { brands, activeBrand } = useAuth();
  const { generateNewCalendar } = useCalendar();

  const [step, setStep] = useState(1);
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

  const [campaignType, setCampaignType] = useState('launch');
  const [customTopic, setCustomTopic] = useState('');
  const [targetPlatforms, setTargetPlatforms] = useState(['Instagram', 'LinkedIn', 'X/Twitter']);
  const [month, setMonth] = useState('September 2026');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStageText, setGenerationStageText] = useState('Analyzing brand voice...');

  if (!isOpen) return null;

  const togglePlatform = (p) => {
    if (targetPlatforms.includes(p)) {
      if (targetPlatforms.length > 1) {
        setTargetPlatforms(targetPlatforms.filter((item) => item !== p));
      }
    } else {
      setTargetPlatforms([...targetPlatforms, p]);
    }
  };

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setStep(3); // Progress screen

    // Realistic multi-stage generation progress
    const stages = [
      { progress: 15, text: 'Extracting audience persona and tone rules...' },
      { progress: 35, text: 'Engineering platform-specific prompts (IG, LinkedIn, X)...' },
      { progress: 60, text: 'Synthesizing 30 unique content hooks & hashtag batches...' },
      { progress: 85, text: 'Optimizing scheduling distribution across 30 days...' },
      { progress: 100, text: 'Content calendar ready! Launching workspace...' },
    ];

    for (const stage of stages) {
      setGenerationProgress(stage.progress);
      setGenerationStageText(stage.text);
      await new Promise((r) => setTimeout(r, 550));
    }

    try {
      const brand = brands.find((b) => b._id === selectedBrandId) || activeBrand || brands[0];
      const targetBrandId = brand?._id || selectedBrandId || activeBrand?._id;
      const res = await generateNewCalendar({
        brandId: targetBrandId,
        topic: customTopic || `${brand?.name || 'Brand'} - ${CAMPAIGN_PRESETS.find(c => c.id === campaignType)?.title || 'Campaign'}`,
        month,
      });

      if (onGenerated) {
        onGenerated(res);
      }
      onClose();
    } catch (err) {
      console.error(err);
      onClose();
    } finally {
      setIsGenerating(false);
      setStep(1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden transition-all select-none">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-indigo-500/20">
              <Wand2 className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-display">
                30-Day AI Content Calendar Wizard
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Step {step} of 3 • Automated Groq AI Generation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 md:p-8">
          {/* STEP 1: Select Brand & Campaign Goal */}
          {step === 1 && (
            <div className="flex flex-col gap-6 animate-scale-in">
              {/* Select Brand */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  1. Choose Brand Profile
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {brands && brands.length > 0 ? (
                    brands.map((b) => {
                      const isSelected = selectedBrandId === b._id;
                      return (
                        <div
                          key={b._id}
                          onClick={() => setSelectedBrandId(b._id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                              style={{ backgroundColor: b.color || '#4f46e5' }}
                            />
                            <div className="min-w-0">
                              <p className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">{b.name}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">{b.tone}</p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-slate-400">No brand found. Will use default persona.</div>
                  )}
                </div>
              </div>

              {/* Select Campaign Objective */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  2. Select Campaign Objective Preset
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CAMPAIGN_PRESETS.map((p) => {
                    const isSelected = campaignType === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setCampaignType(p.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">{p.title}</span>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{p.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next Button */}
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  <span>Configure Topic & Platforms</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Custom Topic & Target Platforms */}
          {step === 2 && (
            <div className="flex flex-col gap-6 animate-scale-in">
              {/* Topic Input */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Target Topic / Posting Goals (Optional)
                </label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. '3 posts/week on morning routines, mindfulness tips, and product features'..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-xs"
                />
              </div>

              {/* Target Platforms */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Target Social Platforms
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div
                    onClick={() => togglePlatform('Instagram')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      targetPlatforms.includes('Instagram')
                        ? 'border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="flex items-center gap-2 font-extrabold text-xs">
                      <Instagram className="w-4 h-4 text-pink-500" /> Instagram
                    </span>
                    {targetPlatforms.includes('Instagram') && <Check className="w-3.5 h-3.5 text-pink-600" />}
                  </div>

                  <div
                    onClick={() => togglePlatform('LinkedIn')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      targetPlatforms.includes('LinkedIn')
                        ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="flex items-center gap-2 font-extrabold text-xs">
                      <Linkedin className="w-4 h-4 text-[#0A66C2]" /> LinkedIn
                    </span>
                    {targetPlatforms.includes('LinkedIn') && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </div>

                  <div
                    onClick={() => togglePlatform('X/Twitter')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      targetPlatforms.includes('X/Twitter')
                        ? 'border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="flex items-center gap-2 font-extrabold text-xs">
                      <Twitter className="w-4 h-4 text-slate-800 dark:text-slate-200" /> X / Twitter
                    </span>
                    {targetPlatforms.includes('X/Twitter') && <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white" />}
                  </div>
                </div>
              </div>

              {/* Month Selection */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Target Month
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="September 2026">September 2026</option>
                  <option value="October 2026">October 2026</option>
                  <option value="November 2026">November 2026</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-extrabold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleStartGeneration}
                  className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs shadow-xl shadow-indigo-500/25 transition-all transform active:scale-95 cursor-pointer border border-indigo-400/30"
                >
                  <Wand2 className="w-4 h-4 text-amber-300" />
                  <span>Generate 30 Posts</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Generation Progress Overlay */}
          {step === 3 && (
            <div className="flex flex-col items-center text-center py-8 gap-6 animate-fade-in">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-950" />
                <div
                  className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"
                  style={{ animationDuration: '1.5s' }}
                />
                <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              </div>

              <div className="max-w-md">
                <h4 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-display">
                  Groq AI 120B Engine Generating...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5">
                  {generationStageText}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-sm bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700">
                <div
                  className="bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>

              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                {generationProgress}% Complete
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiGenerateModal;
