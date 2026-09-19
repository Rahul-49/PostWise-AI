import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Heart, 
  Eye, 
  Instagram, 
  Linkedin, 
  Twitter,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCalendar } from '../context/CalendarContext';

const Analytics = () => {
  const { activeBrand } = useAuth();
  const { posts } = useCalendar();

  // Compute analytics dynamically from active posts
  const analyticsData = useMemo(() => {
    const totalPosts = posts.length;
    
    // Default metrics if no posts exist yet
    if (totalPosts === 0) {
      return {
        bestTimeToPost: '9:00 AM (Est)',
        totalImpressions: 0,
        avgEngagementRate: '0.0%',
        totalEngagement: 0,
        topPlatform: 'LinkedIn',
        platformBreakdown: [],
        dayOfWeekPerformance: [
          { day: 'Mon', score: 40, best: false },
          { day: 'Tue', score: 85, best: true },
          { day: 'Wed', score: 65, best: false },
          { day: 'Thu', score: 90, best: true },
          { day: 'Fri', score: 70, best: false },
          { day: 'Sat', score: 45, best: false },
          { day: 'Sun', score: 30, best: false },
        ],
        topPosts: []
      };
    }

    // Platform map
    const platformMap = {
      LinkedIn: { count: 0, color: '#0077b5' },
      Twitter: { count: 0, color: '#1da1f2' },
      X: { count: 0, color: '#1da1f2' },
      Instagram: { count: 0, color: '#e1306c' }
    };

    const daysCount = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    let calculatedImpressions = 0;
    let calculatedEngagement = 0;

    posts.forEach((p, idx) => {
      // Platform breakdown
      const platformKey = p.platform === 'X' ? 'Twitter' : p.platform || 'LinkedIn';
      if (platformMap[platformKey]) {
        platformMap[platformKey].count += 1;
      }

      // Impressions & Engagement based on character count / quality
      const charCount = (p.caption || p.idea || '').length;
      const baseImp = 500 + (charCount % 1200) + (idx * 150);
      const baseEng = Math.round(baseImp * (0.03 + (idx % 4) * 0.015));

      calculatedImpressions += baseImp;
      calculatedEngagement += baseEng;

      // Day of week
      if (p.date) {
        const d = new Date(p.date);
        if (!isNaN(d.getTime())) {
          const dayName = dayNames[d.getUTCDay()];
          if (daysCount[dayName] !== undefined) {
            daysCount[dayName] += 1;
          }
        }
      }
    });

    const avgEngRate = totalPosts > 0 ? ((calculatedEngagement / calculatedImpressions) * 100).toFixed(1) + '%' : '0.0%';

    // Top Platform
    let topPlatform = 'LinkedIn';
    let maxCount = -1;
    Object.entries(platformMap).forEach(([plat, data]) => {
      if (data.count > maxCount) {
        maxCount = data.count;
        topPlatform = plat;
      }
    });

    // Breakdown list
    const platformBreakdown = Object.entries(platformMap)
      .filter(([_, data]) => data.count > 0)
      .map(([plat, data]) => {
        const platformImp = Math.round((data.count / totalPosts) * calculatedImpressions);
        const rate = (4.2 + (data.count % 3) * 0.8).toFixed(1) + '%';
        return {
          platform: plat,
          posts: data.count,
          impressions: platformImp,
          engagementRate: rate,
          color: data.color
        };
      });

    // Days heatmap
    const maxDayCount = Math.max(...Object.values(daysCount), 1);
    const dayOfWeekPerformance = dayNames.map((day) => {
      const cnt = daysCount[day];
      const score = cnt === 0 ? 30 : Math.round(40 + (cnt / maxDayCount) * 55);
      return {
        day,
        score,
        best: score >= 80
      };
    });

    // Top Posts list
    const topPosts = posts.slice(0, 5).map((p, i) => {
      const imp = 800 + ((p.caption?.length || 50) * 12) + (i * 300);
      const likes = Math.round(imp * 0.04);
      const comments = Math.round(likes * 0.25);
      return {
        title: p.idea || p.caption || 'Scheduled Content Post',
        platform: p.platform || 'LinkedIn',
        impressions: imp,
        engagement: (3.8 + (i % 3) * 1.2).toFixed(1) + '%',
        likes,
        comments
      };
    });

    return {
      bestTimeToPost: '9:00 AM & 2:00 PM',
      totalImpressions: calculatedImpressions,
      avgEngagementRate: avgEngRate,
      totalEngagement: calculatedEngagement,
      topPlatform,
      platformBreakdown: platformBreakdown.length > 0 ? platformBreakdown : [
        { platform: 'LinkedIn', posts: totalPosts, impressions: calculatedImpressions, engagementRate: '5.2%', color: '#0077b5' }
      ],
      dayOfWeekPerformance,
      topPosts
    };
  }, [posts]);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors backdrop-blur-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 text-xs font-bold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            Predicted AI Performance Insights
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight font-display">
            Content Analytics & Engagement Forecasting
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Active Workspace: <strong className="text-slate-800 dark:text-slate-200">{activeBrand?.brandName || activeBrand?.name || 'EcoGlow Wellness'}</strong> • Live Content Analysis
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-2.5 rounded-2xl shadow-xs">
          <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <div className="text-xs">
            <span className="text-slate-400 dark:text-slate-400 block text-[10px] font-medium">Optimal Timing</span>
            <strong className="text-slate-800 dark:text-slate-200 font-bold">{analyticsData.bestTimeToPost}</strong>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Estimated Impressions</span>
            <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-display">
            {analyticsData.totalImpressions.toLocaleString()}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +24% vs previous month
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Engagement Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display">
            {analyticsData.avgEngagementRate}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Across {posts.length} scheduled posts
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Interactions</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-display">
            {analyticsData.totalEngagement.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Likes, comments & reposts
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900/80 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-subtle transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Top Performing Platform</span>
            {analyticsData.topPlatform === 'Instagram' ? (
              <Instagram className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            ) : analyticsData.topPlatform === 'LinkedIn' ? (
              <Linkedin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <Twitter className="w-4 h-4 text-sky-500" />
            )}
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 truncate font-display">
            {analyticsData.topPlatform}
          </div>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-2">
            Primary driver of audience reach
          </p>
        </div>
      </div>

      {/* Charts & Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Platform Breakdown (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">Platform Performance Breakdown</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Impressions & engagement rate per channel</p>
              </div>
              <BarChart3 className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-4">
              {analyticsData.platformBreakdown.map((item) => (
                <div key={item.platform} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.platform} ({item.posts} posts)
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400">{item.engagementRate} eng.</span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden mb-1">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: item.color,
                        width: `${Math.min(100, Math.max(10, (item.impressions / (analyticsData.totalImpressions || 1)) * 100))}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-400 font-medium">
                    <span>Forecast: {item.impressions.toLocaleString()} impressions</span>
                    <span>Target: +15% QoQ</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Instagram drives high comment velocity, while LinkedIn generates superior B2B decision-maker engagement.
          </div>
        </div>

        {/* Right: Best Days Heatmap / Bar Chart (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">Engagement by Day of the Week</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Relative audience activity index</p>
              </div>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>

            <div className="grid grid-cols-7 gap-2 pt-6 pb-2 items-end h-44">
              {analyticsData.dayOfWeekPerformance.map((d) => (
                <div key={d.day} className="flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{d.score}%</span>
                  <div
                    className={`w-full max-w-[32px] rounded-t-xl transition-all duration-500 ${
                      d.best
                        ? 'bg-gradient-to-t from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/20'
                        : 'bg-slate-200 dark:bg-slate-750 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                    style={{ height: `${d.score}%` }}
                  />
                  <span className={`text-xs font-bold ${d.best ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>AI Suggestion: Schedule key product launches and announcement posts on <strong>Tuesday & Thursday mornings</strong>.</span>
          </div>
        </div>
      </div>

      {/* Top Performing Posts Table */}
      <div className="bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display mb-4">
          Top Predicted Viral Posts
        </h3>

        {analyticsData.topPosts.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">No posts generated yet. Create a calendar to view performance predictions.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3">Post Title</th>
                  <th className="pb-3">Platform</th>
                  <th className="pb-3">Impressions</th>
                  <th className="pb-3">Eng. Rate</th>
                  <th className="pb-3">Predicted Likes</th>
                  <th className="pb-3">Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {analyticsData.topPosts.map((post, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 font-bold text-slate-900 dark:text-slate-100 max-w-xs truncate pr-4">
                      {post.title}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {post.platform}
                      </span>
                    </td>
                    <td className="py-3.5 font-semibold text-slate-700 dark:text-slate-300">
                      {post.impressions.toLocaleString()}
                    </td>
                    <td className="py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                      {post.engagement}
                    </td>
                    <td className="py-3.5 text-slate-600 dark:text-slate-400">
                      {post.likes}
                    </td>
                    <td className="py-3.5 text-slate-600 dark:text-slate-400">
                      {post.comments}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;

