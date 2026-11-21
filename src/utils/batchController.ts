/**
 * Batch Mode Execution Controller with cancellation and safe termination support.
 */
export class BatchExecutionController {
  private isCancelled: boolean = false;

  public cancelRun(): void {
    this.isCancelled = true;
    console.info("Batch run stop signal received. Halting execution gracefully...");
  }

  public checkStatus(): boolean {
    return this.isCancelled;
  }
}
