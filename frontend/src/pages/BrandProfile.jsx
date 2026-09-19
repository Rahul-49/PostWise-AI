import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { brandAPI } from '../services/api';
import { 
  Building2, 
  Save, 
  Trash2, 
  Plus, 
  Sparkles, 
  Check, 
  Globe, 
  Tag, 
  MessageSquare, 
  Target,
  Instagram,
  Linkedin,
  Twitter,
  Wand2,
  CheckCircle2
} from 'lucide-react';

const TONE_OPTIONS = [
  'Inspirational',
  'Professional & Authoritative',
  'Playful & Witty',
  'Educational & Analytical',
  'Bold & Direct',
  'Warm & Mindful',
];

const PRESETS = [
  {
    name: 'EcoGlow Wellness',
    niche: 'Sustainable Living & Mindful Yoga',
    targetAudience: 'Health-conscious professionals, eco-minded millennials (ages 24-42)',
    tone: 'Warm & Mindful',
    postingGoals: 'Build high-trust community, share daily wellness habits, promote cork mats',
    handles: { instagram: '@ecoglow.wellness', linkedin: 'EcoGlow Global', twitter: '@EcoGlowLife' },
    color: '#059669',
  },
  {
    name: 'NexusAI Cloud',
    niche: 'Developer Tools & Cloud Infrastructure',
    targetAudience: 'Full-stack engineers, DevOps leads, engineering founders',
    tone: 'Professional & Authoritative',
    postingGoals: 'Showcase low latency benchmarks, build community for v2 launch',
    handles: { instagram: '@nexusai_hq', linkedin: 'NexusAI Systems', twitter: '@nexusai_dev' },
    color: '#4f46e5',
  },
  {
    name: 'Velvet Bean Roasters',
    niche: 'Artisanal Specialty Coffee & Cold Brew',
    targetAudience: 'Specialty coffee lovers, remote creatives, cafe regulars',
    tone: 'Playful & Witty',
    postingGoals: 'Single-origin farmer spotlights, pour-over tips, coffee club subscriptions',
    handles: { instagram: '@velvetbeancoffee', linkedin: 'Velvet Bean Roasters', twitter: '@VelvetBeanCo' },
    color: '#d97706',
  },
];

const BrandProfile = () => {
  const { brands, activeBrand, selectActiveBrand, refreshBrands, showToast } = useAuth();

  const [selectedBrandId, setSelectedBrandId] = useState(null);
  const [isEditingNew, setIsEditingNew] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [niche, setNiche] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('Inspirational');
  const [postingGoals, setPostingGoals] = useState('');
  const [igHandle, setIgHandle] = useState('');
  const [liHandle, setLiHandle] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [color, setColor] = useState('#4f46e5');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeBrand && !isEditingNew) {
      loadBrandToForm(activeBrand);
    } else if (brands && brands.length > 0 && !isEditingNew) {
      loadBrandToForm(brands[0]);
    }
  }, [activeBrand, brands]);

  const loadBrandToForm = (brand) => {
    setSelectedBrandId(brand._id);
    setIsEditingNew(false);
    setName(brand.name || '');
    setNiche(brand.niche || brand.industry || '');
    setTargetAudience(brand.targetAudience || '');
    setTone(brand.tone || 'Inspirational');
    setPostingGoals(brand.postingGoals || '');
    setIgHandle(brand.handles?.instagram || '');
    setLiHandle(brand.handles?.linkedin || '');
    setXHandle(brand.handles?.twitter || '');
    setColor(brand.color || '#4f46e5');
  };

  const handleCreateNewClick = () => {
    setSelectedBrandId(null);
    setIsEditingNew(true);
    setName('');
    setNiche('');
    setTargetAudience('');
    setTone('Inspirational');
    setPostingGoals('');
    setIgHandle('');
    setLiHandle('');
    setXHandle('');
    setColor('#4f46e5');
  };

  const handleApplyPreset = (preset) => {
    setName(preset.name);
    setNiche(preset.niche);
    setTargetAudience(preset.targetAudience);
    setTone(preset.tone);
    setPostingGoals(preset.postingGoals);
    setIgHandle(preset.handles.instagram);
    setLiHandle(preset.handles.linkedin);
    setXHandle(preset.handles.twitter);
    setColor(preset.color);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name,
        niche,
        targetAudience,
        tone,
        postingGoals,
        handles: {
          instagram: igHandle,
          linkedin: liHandle,
          twitter: xHandle,
        },
        color,
      };

      if (isEditingNew) {
        const res = await brandAPI.createBrand(payload);
        const created = res?.data?.brand || res?.brand || res;
        await refreshBrands();
        if (created) {
          selectActiveBrand(created);
          loadBrandToForm(created);
        }
        showToast && showToast('Brand profile created successfully!', 'success');
      } else if (selectedBrandId) {
        const res = await brandAPI.updateBrand(selectedBrandId, payload);
        const updated = res?.data?.brand || res?.brand || res;
        await refreshBrands();
        if (updated) {
          selectActiveBrand(updated);
        }
        showToast && showToast('Brand profile updated successfully!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast && showToast('Failed to save brand profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBrandId || isEditingNew) return;
    if (window.confirm(`Are you sure you want to delete brand "${name}"?`)) {
      setLoading(true);
      try {
        await brandAPI.deleteBrand(selectedBrandId);
        await refreshBrands();
        showToast && showToast('Brand profile deleted', 'success');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-display">
              Brand Profile & Persona Vault
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Configure target audience, tone of voice, niche, and platform handles for AI generation
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateNewClick}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-extrabold shadow-md shadow-indigo-500/20 transition-all transform active:scale-95 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Brand</span>
        </button>
      </div>

      {/* Main Content Layout: Brand Switcher Cards + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column: Brand Selector List (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900/80 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3">
              Your Brand Personas ({brands.length})
            </span>

            <div className="flex flex-col gap-2.5">
              {brands.map((b) => {
                const isSelected = !isEditingNew && selectedBrandId === b._id;
                return (
                  <div
                    key={b._id}
                    onClick={() => {
                      selectActiveBrand(b);
                      loadBrandToForm(b);
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: b.color || '#4f46e5' }}
                      />
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">{b.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">{b.tone}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                        Active
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preset Quick Fill Section */}
          <div className="bg-gradient-to-br from-indigo-50/80 to-violet-50/80 dark:from-indigo-950/40 dark:to-violet-950/40 p-5 rounded-3xl border border-indigo-100 dark:border-indigo-900/60 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-900 dark:text-indigo-300 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Quick Brand Presets</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3">
              Load sample brand profiles instantly for testing:
            </p>

            <div className="flex flex-col gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 hover:border-indigo-300 dark:hover:border-indigo-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors shadow-xs cursor-pointer flex items-center justify-between"
                >
                  <span className="truncate">{p.name}</span>
                  <span className="text-[10px] font-medium text-slate-400">{p.tone.split('&')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Brand Configuration Form (8 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white dark:bg-slate-900/80 p-6 md:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-display">
                {isEditingNew ? 'Create New Brand Profile' : `Editing: ${name || 'Brand Profile'}`}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Brand Color:</span>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-7 h-7 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
                />
              </div>
            </div>

            {/* Brand Name & Niche */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Brand / Company Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs font-extrabold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-xs"
                  placeholder="e.g. EcoGlow Wellness"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Niche / Industry Category
                </label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-xs"
                  placeholder="e.g. Sustainable Living & Mindful Yoga"
                  required
                />
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Target Audience Demographics & Persona
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-xs"
                placeholder="e.g. Health-conscious professionals, eco-minded millennials (ages 24-42)..."
                required
              />
            </div>

            {/* Tone of Voice Selector */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Brand Tone of Voice
              </label>
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      tone === t
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Core Posting Goals */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Core Social Media Posting Goals
              </label>
              <textarea
                rows={3}
                value={postingGoals}
                onChange={(e) => setPostingGoals(e.target.value)}
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs font-normal text-slate-900 dark:text-slate-100 leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-xs resize-none"
                placeholder="e.g. Build community trust, promote 3 core product launches per month, share actionable daily wellness habits..."
              />
            </div>

            {/* Platform Handles Grid */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Social Handles (For Preview Cards)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
                  <Instagram className="w-4 h-4 text-pink-500 shrink-0" />
                  <input
                    type="text"
                    value={igHandle}
                    onChange={(e) => setIgHandle(e.target.value)}
                    placeholder="@instagram"
                    className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
                  <Linkedin className="w-4 h-4 text-[#0A66C2] shrink-0" />
                  <input
                    type="text"
                    value={liHandle}
                    onChange={(e) => setLiHandle(e.target.value)}
                    placeholder="LinkedIn Profile"
                    className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
                  <Twitter className="w-4 h-4 text-slate-800 dark:text-slate-200 shrink-0" />
                  <input
                    type="text"
                    value={xHandle}
                    onChange={(e) => setXHandle(e.target.value)}
                    placeholder="@twitter"
                    className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {!isEditingNew && selectedBrandId ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-extrabold transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete Profile
              </button>
            ) : <div />}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving Profile...' : 'Save Brand Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandProfile;
