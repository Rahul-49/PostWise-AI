import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Calendar as CalendarIcon, 
  Clock, 
  RotateCw, 
  Save, 
  Trash2, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  ThumbsUp, 
  Repeat2, 
  Send, 
  MoreHorizontal,
  Lightbulb,
  CheckCircle2,
  Wand2
} from 'lucide-react';
import { useCalendar } from '../context/CalendarContext';
import { useAuth } from '../context/AuthContext';
import { PexelsCarousel } from './PexelsCarousel';
import { postAPI } from '../services/api';

const PostEditorModal = () => {
  const { selectedPost, isEditorOpen, closePostEditor, updatePost, deletePost, regeneratePost } = useCalendar();
  const { activeBrand } = useAuth();

  const [previewPlatform, setPreviewPlatform] = useState('Instagram');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [hashtagsStr, setHashtagsStr] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [status, setStatus] = useState('draft');
  const [postType, setPostType] = useState('Single Image');
  const [dateStr, setDateStr] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00 AM');
  const [imagePrompt, setImagePrompt] = useState('');
  const [engagementTip, setEngagementTip] = useState('');

  const [customInstruction, setCustomInstruction] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
const [isPublishing, setIsPublishing] = useState(false);
const [pexelsPhotos, setPexelsPhotos] = useState([]);
const [pexelsLoading, setPexelsLoading] = useState(false);

  const handlePublishLinkedIn = async () => {
    if (!selectedPost) return;
    setIsPublishing(true);
    try {
      const data = await postAPI.publishLinkedIn(selectedPost._id);
      alert('Successfully published to LinkedIn! Post URN: ' + (data.linkedinUrn || ''));
      if (updatePost) {
        updatePost(selectedPost._id, { linkedinStatus: 'published', linkedinUrn: data.linkedinUrn });
      }
    } catch (e) {
      console.error('LinkedIn publish error:', e);
      const msg = e?.response?.data?.message || e?.message || 'Error publishing to LinkedIn';
      alert('Failed to publish to LinkedIn: ' + msg);
    } finally {
      setIsPublishing(false);
    }
  };

  useEffect(() => {
    if (selectedPost) {
      setTitle(selectedPost.title || '');
      setCaption(selectedPost.caption || '');
      setHashtagsStr(
        Array.isArray(selectedPost.hashtags)
          ? selectedPost.hashtags.join(' ')
          : selectedPost.hashtags || ''
      );
      setPlatform(selectedPost.platform || 'Instagram');
      setPreviewPlatform(selectedPost.platform || 'Instagram');
      setStatus(selectedPost.status || 'draft');
      setPostType(selectedPost.postType || 'Single Image');
      setTimeSlot(selectedPost.timeSlot || '09:00 AM');
      setImagePrompt(selectedPost.imagePrompt || '');
      setEngagementTip(selectedPost.engagementTip || '');

      if (selectedPost.date) {
        const cleanDate = selectedPost.date.split('T')[0];
        setDateStr(cleanDate);
      }
    }
  }, [selectedPost]);

  // Build a search term from post content with at least 1 and at most 3 words
  const buildSearchTerm = (targetTitle = title, targetCaption = caption) => {
    const combined = `${targetTitle || ''} ${targetCaption || ''}`.trim();
    if (!combined) return 'lifestyle';

    const stopWords = new Set([
      'the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'it',
      'this', 'that', 'your', 'you', 'how', 'why', 'what', 'are', 'was', 'were', 'from', 'we', 'our',
      'post', 'tip', 'tips', 'here', 'day', 'days', 'more'
    ]);

    const words = combined
      .replace(/[#@$%^&*()_+=[\]{};':"\\|,.<>/?`~!-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w.toLowerCase()));

    const selected = words.slice(0, 3);
    return selected.length > 0 ? selected.join(' ') : 'content';
  };

  const fetchPexelsImages = async (customTerm) => {
    const term = customTerm !== undefined ? customTerm : buildSearchTerm();
    if (!term || !term.trim()) return;
    setPexelsLoading(true);
    try {
      const res = await fetch(`/api/pexels/search?term=${encodeURIComponent(term.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setPexelsPhotos(data.photos || []);
      }
    } catch (err) {
      console.error('Error fetching Pexels images:', err);
    } finally {
      setPexelsLoading(false);
    }
  };

  // Fetch images from Pexels when post opens
  useEffect(() => {
    if (selectedPost) {
      const term = buildSearchTerm(selectedPost.title, selectedPost.caption);
      fetchPexelsImages(term);
    }
  }, [selectedPost]);

  if (!isEditorOpen || !selectedPost) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formattedHashtags = hashtagsStr
        .split(/[\s,]+/)
        .map((h) => (h.startsWith('#') ? h : `#${h}`))
        .filter((h) => h.length > 1);

      await updatePost(selectedPost._id, {
        title,
        caption,
        hashtags: formattedHashtags,
        platform,
        status,
        postType,
        date: dateStr,
        timeSlot,
        imagePrompt,
        engagementTip,
      });
      closePostEditor();
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const updated = await regeneratePost(selectedPost._id, customInstruction);
      if (updated) {
        setTitle(updated.title || updated.idea);
      setCaption(updated.caption);
      setHashtagsStr(
        Array.isArray(updated.hashtags)
          ? updated.hashtags.join(' ')
          : updated.hashtags || ''
      );
      setImagePrompt(updated.imagePrompt || '');
      setEngagementTip(updated.engagementTip || '');

        // Fetch fresh Pexels photos matching the regenerated content
        const newTerm = buildSearchTerm(updated.title, updated.caption);
        fetchPexelsImages(newTerm);
      }
      setCustomInstruction('');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this scheduled post?')) {
      await deletePost(selectedPost._id);
    }
  };

  const handleClose = () => {
    setPexelsPhotos([]);
    closePostEditor();
  };


  const characterCount = caption.length;
  const wordCount = caption.trim() ? caption.trim().split(/\s+/).length : 0;
  const isOverTwitterLimit = previewPlatform === 'X/Twitter' && characterCount > 280;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden transition-all">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-display">Post Details & Live Platform Feed</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Tailor captions, preview across platforms, or regenerate single post with Groq AI
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Fields (7 cols) */}
          <form onSubmit={handleSave} className="lg:col-span-7 flex flex-col gap-4">
            {/* Title */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Post Title / Hook Header
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-extrabold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-xs"
                placeholder="e.g. 5-Minute Morning Reset Habit"
                required
              />
            </div>

            {/* Platform & Format Grid */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => {
                    setPlatform(e.target.value);
                    setPreviewPlatform(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="X/Twitter">X / Twitter</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Post Format Type
                </label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Single Image">Single Image</option>
                  <option value="Carousel">Carousel</option>
                  <option value="Reel / Short Video">Reel / Short Video</option>
                  <option value="Text Article">Text Article</option>
                  <option value="Poll / Question">Poll / Question</option>
                </select>
              </div>
            </div>

            {/* Date, Time & Status Grid */}
            <div className="grid grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Schedule Date
                </label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Time Slot
                </label>
                <input
                  type="text"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="09:00 AM"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Publish Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            {/* Caption TextArea with Word/Char Counter */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Post Caption Copy
                </label>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 font-bold">
                  <span>{wordCount} words</span>
                  <span>•</span>
                  <span className={isOverTwitterLimit ? 'text-rose-600 font-extrabold' : ''}>
                    {characterCount} chars {previewPlatform === 'X/Twitter' && '/ 280'}
                  </span>
                </div>
              </div>
              <textarea
                rows={5}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-normal text-slate-800 dark:text-slate-100 leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none resize-none shadow-xs"
                placeholder="Write or edit post copy..."
                required
              />
            </div>

            {/* Hashtags */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Hashtags (separated by space)
              </label>
              <input
                type="text"
                value={hashtagsStr}
                onChange={(e) => setHashtagsStr(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none shadow-xs"
                placeholder="#Wellness #MindfulLiving #Growth"
              />
            </div>

            {/* AI Graphic Prompt */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                AI Visual Prompt / Graphic Style Direction
              </label>
              <input
                type="text"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                placeholder="Describe suggested graphic, image, or video style..."
              />
            </div>

            {/* Single Post AI Regeneration Box */}
            <div className="p-4 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex flex-col gap-3 mt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-900 dark:text-indigo-300">
                  <Wand2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Regenerate Single Post with Custom AI Direction
                </div>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  {isRegenerating ? 'Crafting idea...' : 'Regenerate'}
                </button>
              </div>

              <input
                type="text"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="e.g. 'Make it more casual with a stronger question hook at the end'..."
                className="w-full px-3.5 py-2 rounded-2xl border border-indigo-200/80 dark:border-indigo-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {/* Pexels Visual Match & Search Indicator */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700 dark:text-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Pexels Visual Match
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    {pexelsPhotos.length} {pexelsPhotos.length === 1 ? 'photo' : 'photos'} found
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => fetchPexelsImages(buildSearchTerm())}
                  disabled={pexelsLoading}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <RotateCw className={`w-3 h-3 ${pexelsLoading ? 'animate-spin' : ''}`} />
                  {pexelsLoading ? 'Searching…' : 'Refresh Images'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Matched search term: <span className="font-bold text-slate-700 dark:text-slate-300">"{buildSearchTerm()}"</span> (displayed in post display preview)
              </p>
            </div>
          </form>

          {/* Right Column: Live Feed Simulation (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Live Feed Preview
              </span>

              {/* Platform Preview Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setPreviewPlatform('Instagram')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    previewPlatform === 'Instagram'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-pink-500'
                  }`}
                >
                  IG
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPlatform('LinkedIn')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    previewPlatform === 'LinkedIn'
                      ? 'bg-[#0A66C2] text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-blue-500'
                  }`}
                >
                  LinkedIn
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPlatform('X/Twitter')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    previewPlatform === 'X/Twitter'
                      ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  X
                </button>
              </div>
            </div>

            {/* INSTAGRAM SIMULATION */}
            {previewPlatform === 'Instagram' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-card overflow-hidden text-xs transition-colors">
                <div className="p-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600">
                      <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full p-[1px]">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                          alt="brand"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                        {activeBrand?.handles?.instagram || 'brand.official'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">Original Post • {postType}</p>
                    </div>
                  </div>
                  <MoreHorizontal className="w-4 h-4 text-slate-400" />
                </div>

                <div className="relative aspect-square bg-slate-900 flex flex-col justify-end p-4 text-white overflow-hidden">
                  {pexelsLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-300 gap-2 z-10">
                      <RotateCw className="w-6 h-6 animate-spin text-indigo-400" />
                      <span className="text-xs font-semibold">Finding Pexels pictures...</span>
                    </div>
                  ) : pexelsPhotos.length > 0 ? (
                    <PexelsCarousel photos={pexelsPhotos} className="absolute inset-0 w-full h-full rounded-none" />
                  ) : (
                    <img
                      src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80"
                      alt="post visual"
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
                  
                  <div className="relative z-10 pointer-events-none">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-extrabold mb-1">
                      {pexelsPhotos.length > 1 ? 'Carousel' : postType}
                    </span>
                    <p className="font-extrabold text-sm text-white drop-shadow leading-snug">
                      {title}
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-rose-500 fill-rose-500 cursor-pointer" />
                      <MessageCircle className="w-5 h-5 text-slate-700 dark:text-slate-300 cursor-pointer" />
                      <Send className="w-5 h-5 text-slate-700 dark:text-slate-300 cursor-pointer" />
                    </div>
                    <Bookmark className="w-5 h-5 text-slate-700 dark:text-slate-300 cursor-pointer" />
                  </div>

                  <p className="font-extrabold text-[11px] text-slate-900 dark:text-slate-100 mb-1">412 likes</p>

                  <div className="text-slate-800 dark:text-slate-200 leading-relaxed max-h-36 overflow-y-auto pr-1 font-normal">
                    <span className="font-extrabold mr-1.5 text-slate-900 dark:text-slate-100">
                      {activeBrand?.handles?.instagram || 'brand.official'}
                    </span>
                    <span className="whitespace-pre-line">{caption}</span>
                  </div>

                  {hashtagsStr && (
                    <p className="text-indigo-600 dark:text-indigo-400 font-bold text-[11px] mt-2">
                      {hashtagsStr}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* LINKEDIN SIMULATION */}
            {previewPlatform === 'LinkedIn' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-card p-5 text-xs transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#0A66C2] flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
                      {activeBrand?.name ? activeBrand.name.charAt(0) : 'P'}
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                        {activeBrand?.handles?.linkedin || activeBrand?.name || 'Company Official'}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">14,280 followers • 2h • 🌐</p>
                    </div>
                  </div>
                  <MoreHorizontal className="w-4 h-4 text-slate-400" />
                </div>

                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mb-2">{title}</h4>

                <div className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto pr-1 font-normal">
                  {caption}
                </div>

                {pexelsPhotos.length > 0 && (
                  <div className="mt-3 rounded-2xl overflow-hidden aspect-video relative">
                    <PexelsCarousel photos={pexelsPhotos} className="w-full h-full rounded-2xl" />
                  </div>
                )}

                {hashtagsStr && (
                  <p className="text-[#0A66C2] dark:text-blue-400 font-bold text-xs mt-2.5">{hashtagsStr}</p>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 font-medium">
                  <span className="flex items-center gap-1 font-bold">
                    👍 💡 248 reactions
                  </span>
                  <span>34 comments • 12 reposts</span>
                </div>
              </div>
            )}

            {/* X / TWITTER SIMULATION */}
            {previewPlatform === 'X/Twitter' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-card p-5 text-xs transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white font-extrabold text-xs shrink-0">
                    𝕏
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 truncate">
                        {activeBrand?.name || 'Brand Name'}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {activeBrand?.handles?.twitter || '@brand'}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">now</span>
                    </div>

                    <div className="mt-2 text-slate-900 dark:text-slate-100 whitespace-pre-line leading-relaxed text-sm font-normal">
                      {caption}
                    </div>

                    {pexelsPhotos.length > 0 && (
                      <div className="mt-3 rounded-2xl overflow-hidden aspect-video relative">
                        <PexelsCarousel photos={pexelsPhotos} className="w-full h-full rounded-2xl" />
                      </div>
                    )}

                    {hashtagsStr && (
                      <p className="text-indigo-600 dark:text-indigo-400 font-bold text-xs mt-2">{hashtagsStr}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Strategy Tip Box */}
            {engagementTip && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200">
                <p className="font-extrabold flex items-center gap-1.5 text-amber-950 dark:text-amber-100 mb-0.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Strategy Tip:
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal">{engagementTip}</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-extrabold transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete Post
          </button>

          <div className="flex items-center gap-3">
            {platform === 'LinkedIn' && (
              <button
                type="button"
                onClick={handlePublishLinkedIn}
                disabled={isPublishing}
                className="flex items-center gap-1 px-4 py-2 rounded-2xl bg-[#0A66C2] hover:bg-[#0c73e0] text-white text-xs font-extrabold transition-colors cursor-pointer"
              >
                {isPublishing ? 'Publishing...' : 'Publish to LinkedIn'}
              </button>
            )}
            <button
              type="button"
              onClick={closePostEditor}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 text-xs font-extrabold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostEditorModal;
