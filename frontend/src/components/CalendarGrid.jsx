import React, { useState, useRef, memo } from 'react';
import { 
  Plus, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Image as ImageIcon, 
  Video, 
  Layers, 
  FileText, 
  HelpCircle,
  RotateCw
} from 'lucide-react';
import { useCalendar } from '../context/CalendarContext';

// Helper icons for post types
const getPostTypeIcon = (type) => {
  switch (type) {
    case 'Reel / Short Video':
      return <Video className="w-3 h-3 text-rose-500" />;
    case 'Carousel':
      return <Layers className="w-3 h-3 text-indigo-500" />;
    case 'Text Article':
      return <FileText className="w-3 h-3 text-slate-500 dark:text-slate-400" />;
    case 'Poll / Question':
      return <HelpCircle className="w-3 h-3 text-amber-500" />;
    default:
      return <ImageIcon className="w-3 h-3 text-emerald-500" />;
  }
};

// Platform badge
const getPlatformBadge = (platform) => {
  if (platform === 'Instagram') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs">
        <Instagram className="w-3 h-3" />
        IG
      </span>
    );
  }
  if (platform === 'LinkedIn') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-[#0A66C2] text-white shadow-xs">
        <Linkedin className="w-3 h-3" />
        LinkedIn
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-slate-900 dark:bg-slate-700 text-white shadow-xs">
      <Twitter className="w-3 h-3" />
      X
    </span>
  );
};

// Status indicator
const getStatusBadge = (status) => {
  switch (status) {
    case 'published':
      return <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Published" />;
    case 'scheduled':
      return <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" title="Scheduled" />;
    default:
      return <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Draft" />;
  }
};

// Individual Post Card component
const PostCard = memo(({ post, onSelectPost, onRegenerate, isRegenerating }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', post._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e) => {
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onSelectPost && onSelectPost(post)}
      className={`p-2 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/90 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-card transition-shadow cursor-grab active:cursor-grabbing select-none group/card ${
        isDragging ? 'opacity-30' : 'opacity-100'
      } ${isRegenerating ? 'animate-pulse' : ''}`}
    >
      {/* Top row: Platform + Time + Quick Regenerate */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5">
          {getPlatformBadge(post.platform)}
          {getStatusBadge(post.status)}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRegenerate(post._id);
            }}
            title="Quick regenerate with AI"
            disabled={isRegenerating}
            className="opacity-0 group-hover/card:opacity-100 p-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-opacity cursor-pointer"
          >
            <RotateCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin text-indigo-600 dark:text-indigo-400' : ''}`} />
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
            {post.timeSlot?.split(' ')[0]}
          </span>
        </div>
      </div>

      {/* Post Title */}
      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
        {post.title}
      </p>

      {/* Bottom row: Type Icon & Hashtags count */}
      <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <div className="flex items-center gap-1">
          {getPostTypeIcon(post.postType)}
          <span className="truncate max-w-[90px]">{post.postType?.split(' ')[0]}</span>
        </div>
        {post.hashtags && post.hashtags.length > 0 && (
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            #{post.hashtags.length}
          </span>
        )}
      </div>
    </div>
  );
});

// Self-contained Day Cell component to isolate drag state and avoid parent re-renders
const CalendarDayCell = memo(({ 
  cell, 
  posts, 
  isToday, 
  onSelectPost, 
  onAddPostAtDate, 
  onDropPost, 
  onRegeneratePost, 
  regeneratingId 
}) => {
  const [isTargeted, setIsTargeted] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current += 1;
    if (dragCounter.current === 1) {
      setIsTargeted(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsTargeted(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsTargeted(false);
    const postId = e.dataTransfer.getData('text/plain');
    if (postId) {
      onDropPost(postId, cell.dateStr);
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`bg-white dark:bg-slate-900 min-h-[148px] p-2 flex flex-col justify-between group relative transition-colors duration-100 ${
        isTargeted
          ? 'bg-indigo-50/90 dark:bg-indigo-950/80 ring-2 ring-indigo-500 ring-inset'
          : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
      }`}
    >
      {/* Day Cell Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center justify-center text-sm font-extrabold rounded-lg w-7 h-7 ${
              isToday
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-100'
            }`}
          >
            {cell.dayNumber}
          </span>
          {posts.length > 0 && (
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              ({posts.length})
            </span>
          )}
        </div>

        {/* Quick Add Post on Date button */}
        <button
          type="button"
          onClick={() => onAddPostAtDate && onAddPostAtDate(cell.dateStr)}
          title={`Add post on ${cell.dateStr}`}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-opacity cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Day Posts List */}
      <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[140px] pr-0.5">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onSelectPost={onSelectPost}
            onRegenerate={onRegeneratePost}
            isRegenerating={regeneratingId === post._id}
          />
        ))}
      </div>
    </div>
  );
});

const CalendarGrid = ({ year, month, onSelectPost, onAddPostAtDate }) => {
  const { filteredPosts, reschedulePost, regeneratePost } = useCalendar();
  const [regeneratingId, setRegeneratingId] = useState(null);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days calculations
  const firstDayIndex = new Date(year, month - 1, 1).getDay();
  const totalDaysInMonth = new Date(year, month, 0).getDate();

  // Create grid cells array
  const gridCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    gridCells.push({ isPadding: true, key: `pad-start-${i}` });
  }
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const cellDate = new Date(year, month - 1, d);
    const dateStr = cellDate.toISOString().split('T')[0];
    gridCells.push({
      isPadding: false,
      dayNumber: d,
      dateObj: cellDate,
      dateStr,
      key: `day-${d}`,
    });
  }

  // Group filtered posts by dateStr
  const postsByDateStr = {};
  filteredPosts.forEach((post) => {
    if (!post.date) return;
    const cleanDate = post.date.split('T')[0];
    if (!postsByDateStr[cleanDate]) postsByDateStr[cleanDate] = [];
    postsByDateStr[cleanDate].push(post);
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const handleQuickRegenerate = async (postId) => {
    setRegeneratingId(postId);
    await regeneratePost(postId, 'Make it fresh and high impact');
    setRegeneratingId(null);
  };

  const handleDropPost = (postId, targetDateStr) => {
    reschedulePost(postId, targetDateStr);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden select-none transition-colors">
      {/* Week Header */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/60 text-center text-sm font-extrabold text-slate-600 dark:text-slate-300 py-3.5">
        {daysOfWeek.map((day, idx) => (
          <div key={day} className={idx === 0 || idx === 6 ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid Cells */}
      <div className="grid grid-cols-7 auto-rows-fr bg-slate-100/60 dark:bg-slate-800/60 gap-[1px]">
        {gridCells.map((cell) => {
          if (cell.isPadding) {
            return (
              <div
                key={cell.key}
                className="bg-slate-50/40 dark:bg-slate-900/40 min-h-[148px] p-2 text-slate-300 dark:text-slate-700"
              />
            );
          }

          const cellPosts = postsByDateStr[cell.dateStr] || [];
          const isToday = cell.dateStr === todayStr;

          return (
            <CalendarDayCell
              key={cell.key}
              cell={cell}
              posts={cellPosts}
              isToday={isToday}
              onSelectPost={onSelectPost}
              onAddPostAtDate={onAddPostAtDate}
              onDropPost={handleDropPost}
              onRegeneratePost={handleQuickRegenerate}
              regeneratingId={regeneratingId}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
