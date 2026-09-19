import React from 'react';
import { 
  Calendar, 
  Clock, 
  RotateCw, 
  Edit3, 
  Trash2, 
  Instagram, 
  Linkedin, 
  Twitter,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useCalendar } from '../context/CalendarContext';

const CalendarAgendaView = ({ onSelectPost }) => {
  const { filteredPosts, regeneratePost, deletePost } = useCalendar();

  // Sort filtered posts chronologically
  const sortedPosts = [...filteredPosts].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Helper badge
  const getPlatformBadge = (platform) => {
    if (platform === 'Instagram') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-xs">
          <Instagram className="w-3 h-3" />
          Instagram
        </span>
      );
    }
    if (platform === 'LinkedIn') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0A66C2] text-white shadow-xs">
          <Linkedin className="w-3 h-3" />
          LinkedIn
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white shadow-xs">
        <Twitter className="w-3 h-3" />
        X / Twitter
      </span>
    );
  };

  if (sortedPosts.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-12 text-center shadow-sm transition-colors backdrop-blur-xl">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-display">No Posts Match Your Filters</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto font-medium">
          Try resetting your platform or status filters above, or generate fresh content.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 sm:p-6 divide-y divide-slate-100 dark:divide-slate-800 transition-colors backdrop-blur-xl">
      {sortedPosts.map((post) => {
        const dateFormatted = new Date(post.date).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });

        return (
          <div
            key={post._id}
            className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-start justify-between gap-4 group hover:bg-slate-50/70 dark:hover:bg-slate-800/50 px-3 rounded-xl transition-colors"
          >
            {/* Left Info: Date, Time, Platform */}
            <div className="flex items-start gap-4 min-w-[220px]">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{dateFormatted}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                  <Clock className="w-3 h-3" />
                  {post.timeSlot}
                </span>
                <div className="mt-2">{getPlatformBadge(post.platform)}</div>
              </div>
            </div>

            {/* Middle: Content details */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelectPost(post)}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                  {post.postType}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    post.status === 'published'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                      : post.status === 'scheduled'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                  }`}
                >
                  {post.status}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {post.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                {post.caption}
              </p>

              {/* Hashtags */}
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(Array.isArray(post.hashtags) ? post.hashtags : [post.hashtags]).map((tag, i) => (
                    <span key={i} className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right Action buttons */}
            <div className="flex items-center gap-1 shrink-0 self-end md:self-center">
              <button
                onClick={() => regeneratePost(post._id, 'Refresh tone and hook')}
                title="Regenerate with AI"
                className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectPost(post)}
                title="Edit Post"
                className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => deletePost(post._id)}
                title="Delete Post"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CalendarAgendaView;
