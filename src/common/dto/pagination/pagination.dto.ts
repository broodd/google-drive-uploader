/**
 * [description]
 */
export class PaginationDto<Entity> {
  /**
   * Total number of records.
   */
  public readonly count: number;

  /**
   * Result of the selection by the specified parameters.
   */
  public readonly result: Entity[];

  /**
   * [description]
   * @param result
   * @param count
   */
  constructor([result, count]: [Entity[], number]) {
    this.count = count;
    this.result = result;
  }
}
