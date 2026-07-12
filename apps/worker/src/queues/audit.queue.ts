import { BaseQueue } from "./base.queue.js";
import { QUEUES } from "../constants/queues.js";
import { JOBS } from "../constants/jobs.js";
import {
  CreateAuditCyclePayload,
  GenerateAuditReportPayload,
} from "../types/job.types.js";
import { JobsOptions } from "bullmq";

/**
 * Queue service for coordinating asset audits and processing intensive data reports.
 */
export class AuditQueue extends BaseQueue<
  CreateAuditCyclePayload | GenerateAuditReportPayload
> {
  constructor() {
    super(QUEUES.AUDIT);
  }

  /**
   * Enqueue a job to initiate a new inventory or compliance audit cycle
   */
  public async createCycle(
    auditId: string,
    departmentId: string,
    creatorId: string,
    scope: string[],
    opts?: JobsOptions
  ) {
    const payload: CreateAuditCyclePayload = {
      auditId,
      departmentId,
      creatorId,
      scope,
    };
    return this.addJob(JOBS.AUDIT.CREATE_CYCLE, payload, opts);
  }

  /**
   * Enqueue a job to compile database metrics into a PDF/CSV audit export report
   */
  public async generateReport(
    auditId: string,
    format: "PDF" | "CSV" | "JSON",
    recipientEmail: string,
    opts?: JobsOptions
  ) {
    const payload: GenerateAuditReportPayload = {
      auditId,
      format,
      recipientEmail,
    };
    return this.addJob(JOBS.AUDIT.GENERATE_REPORT, payload, opts);
  }
}
