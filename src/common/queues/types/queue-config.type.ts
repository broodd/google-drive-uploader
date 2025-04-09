import { CronRepeatOptions, JobOptions, JobId } from 'bull';

/**
 * [description]
 */

export interface RepeatJobOptions {
  readonly repeat?:
    | (CronRepeatOptions & {
        key?: string;
        jobId?: JobId | undefined;
      })
    | undefined;
}

/**
 * [description]
 */
export interface QueueEventConfigType {
  name: string;
  options?: JobOptions & RepeatJobOptions;
  data?: Record<string, unknown>;
}

/**
 * [description]
 */
export type QueueConfigType = {
  name: string;
  events?: Record<string, QueueEventConfigType>;
};
