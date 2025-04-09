import { AdvancedConsoleLogger, LoggerOptions, QueryRunner } from 'typeorm';

/**
 * [description]
 */
export class DatabaseLogger extends AdvancedConsoleLogger {
  /**
   * [description]
   * @param options
   */
  constructor(options: LoggerOptions | undefined) {
    super(options);
  }

  /**
   * Excludes query logging for health check
   */
  public logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): void {
    if (query === 'SELECT 1') return;
    return super.logQuery(query, parameters, queryRunner);
  }
}
