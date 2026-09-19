/**
 * Job Service for Asynchronous Calendar Generation
 * Manages background job statuses without blocking HTTP response threads.
 */

const jobs = new Map();

exports.createJob = (jobId, data) => {
  const job = {
    id: jobId,
    status: 'pending', // 'pending' | 'processing' | 'completed' | 'failed'
    progress: 0,
    result: null,
    error: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...data,
  };
  jobs.set(jobId, job);
  return job;
};

exports.updateJob = (jobId, updates) => {
  const job = jobs.get(jobId);
  if (!job) return null;
  const updated = { ...job, ...updates, updatedAt: new Date() };
  jobs.set(jobId, updated);
  return updated;
};

exports.getJob = (jobId) => {
  return jobs.get(jobId) || null;
};

exports.cleanOldJobs = () => {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  for (const [id, job] of jobs.entries()) {
    if (now - new Date(job.createdAt).getTime() > ONE_HOUR) {
      jobs.delete(id);
    }
  }
};
