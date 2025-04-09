import { JobOptions } from 'bull';

/**
 * Default config for Bull job
 */
export const DEFAULT_QUEUE_CONFIG: JobOptions = {
  removeOnComplete: true,
  removeOnFail: true,
};
