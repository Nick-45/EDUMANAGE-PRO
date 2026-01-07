const Queue = require('bull');
const BuildService = require('../services/buildService');
const logger = require('./logger');
const config = require('../config/env');

class QueueManager {
  constructor() {
    this.queues = {};
    this.init();
  }

  init() {
    // Build queue
    this.queues.build = new Queue('build-process', config.REDIS_URL, {
      defaultJobOptions: {
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 50, // Keep last 50 failed jobs
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        }
      },
      limiter: {
        max: 1,
        duration: 1000
      }
    });

    // Payment verification queue
    this.queues.payment = new Queue('payment-verification', config.REDIS_URL, {
      defaultJobOptions: {
        removeOnComplete: 200,
        removeOnFail: 100,
        attempts: 5
      }
    });

    // Email queue
    this.queues.email = new Queue('email-sending', config.REDIS_URL, {
      defaultJobOptions: {
        removeOnComplete: 500,
        removeOnFail: 100,
        attempts: 3
      }
    });

    // Setup processors
    this.setupProcessors();
    
    // Setup event listeners
    this.setupEventListeners();

    logger.info('Queue system initialized');
  }

  setupProcessors() {
    // Build processor
    this.queues.build.process(config.BUILD_QUEUE_CONCURRENCY, async (job) => {
      const { buildId } = job.data;
      
      logger.info(`Processing build job: ${buildId}`);
      
      try {
        const result = await BuildService.processBuild(buildId);
        job.progress(100);
        return result;
      } catch (error) {
        logger.error(`Build job failed: ${buildId}`, error);
        throw error;
      }
    });

    // Payment verification processor
    this.queues.payment.process(async (job) => {
      const { paymentId } = job.data;
      
      logger.info(`Processing payment verification: ${paymentId}`);
      
      // Implement payment verification logic
      await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate processing
      
      return { verified: true, paymentId };
    });

    // Email processor
    this.queues.email.process(async (job) => {
      const { to, subject, template, data } = job.data;
      
      logger.info(`Processing email job: ${subject} to ${to}`);
      
      const emailService = require('../services/emailService');
      await emailService.sendEmail(to, subject, template, data);
      
      return { sent: true, to, subject };
    });
  }

  setupEventListeners() {
    Object.keys(this.queues).forEach(queueName => {
      const queue = this.queues[queueName];
      
      queue.on('completed', (job, result) => {
        logger.info(`${queueName} job completed: ${job.id}`, { result });
      });
      
      queue.on('failed', (job, error) => {
        logger.error(`${queueName} job failed: ${job.id}`, error);
      });
      
      queue.on('stalled', (job) => {
        logger.warn(`${queueName} job stalled: ${job.id}`);
      });
      
      queue.on('progress', (job, progress) => {
        logger.debug(`${queueName} job progress: ${job.id} - ${progress}%`);
      });
    });
  }

  // Add job to queue
  add(queueName, data, options = {}) {
    if (!this.queues[queueName]) {
      throw new Error(`Queue ${queueName} not found`);
    }
    
    return this.queues[queueName].add(data, options);
  }

  // Get job status
  async getJobStatus(queueName, jobId) {
    if (!this.queues[queueName]) {
      throw new Error(`Queue ${queueName} not found`);
    }
    
    const job = await this.queues[queueName].getJob(jobId);
    
    if (!job) {
      return null;
    }
    
    const state = await job.getState();
    
    return {
      id: job.id,
      queue: queueName,
      state,
      data: job.data,
      progress: job.progress(),
      result: job.returnvalue,
      error: job.failedReason,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn
    };
  }

  // Get queue stats
  async getQueueStats(queueName) {
    if (!this.queues[queueName]) {
      throw new Error(`Queue ${queueName} not found`);
    }
    
    const queue = this.queues[queueName];
    
    const [
      waiting,
      active,
      completed,
      failed,
      delayed
    ] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount()
    ]);
    
    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed
    };
  }

  // Clean old jobs
  async cleanOldJobs(queueName, gracePeriod = 1000 * 60 * 60 * 24 * 7) { // 7 days
    if (!this.queues[queueName]) {
      throw new Error(`Queue ${queueName} not found`);
    }
    
    const queue = this.queues[queueName];
    const oldJobs = await queue.getJobs(['completed', 'failed']);
    const now = Date.now();
    
    let cleaned = 0;
    
    for (const job of oldJobs) {
      if (job.finishedOn && (now - job.finishedOn) > gracePeriod) {
        await job.remove();
        cleaned++;
      }
    }
    
    logger.info(`Cleaned ${cleaned} old jobs from ${queueName} queue`);
    
    return cleaned;
  }

  // Pause queue
  async pause(queueName) {
    if (!this.queues[queueName]) {
      throw new Error(`Queue ${queueName} not found`);
    }
    
    await this.queues[queueName].pause();
    logger.info(`Queue ${queueName} paused`);
  }

  // Resume queue
  async resume(queueName) {
    if (!this.queues[queueName]) {
      throw new Error(`Queue ${queueName} not found`);
    }
    
    await this.queues[queueName].resume();
    logger.info(`Queue ${queueName} resumed`);
  }

  // Close all queues
  async closeAll() {
    const closePromises = Object.values(this.queues).map(queue => 
      queue.close()
    );
    
    await Promise.all(closePromises);
    logger.info('All queues closed');
  }
}

module.exports = new QueueManager();
