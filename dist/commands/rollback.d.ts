/**
 * Rollback - delete last git tag and GitHub release
 */
export interface RollbackOptions {
    dryRun?: boolean;
}
/**
 * Rollback last release
 */
export declare function rollback(options?: RollbackOptions): Promise<void>;
//# sourceMappingURL=rollback.d.ts.map