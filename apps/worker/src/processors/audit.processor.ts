import { Job } from "bullmq";
import { BaseProcessor } from "./base.processor.js";
import { QUEUES } from "../constants/queues.js";
import { JOBS } from "../constants/jobs.js";
import { logger } from "../logger/index.js";
import { QueueRegistry } from "../queues/registry.js";
import {
  CreateAuditCyclePayload,
  GenerateAuditReportPayload,
} from "../types/job.types.js";

/**
 * Processor for complex audits and heavy report compilations.
 */
export class AuditProcessor extends BaseProcessor {
  public readonly queueName = QUEUES.AUDIT;

  protected handlers = {
    [JOBS.AUDIT.CREATE_CYCLE]: this.handleCreateCycle,
    [JOBS.AUDIT.GENERATE_REPORT]: this.handleGenerateReport,
  };

  /**
   * Processes the initiation of a new department-wide inventory audit cycle
   */
  private async handleCreateCycle(
    job: Job<CreateAuditCyclePayload>
  ): Promise<void> {
    const payload = job.data;
    logger.info(
      { auditId: payload.auditId, departmentId: payload.departmentId, scopeCount: payload.scope.length },
      `Initializing new audit cycle ${payload.auditId}`
    );

    // In a real application, create audit records in DB:
    // const audit = await db.audit.create({ ... });

    // Inform administrators of the new cycle
    await QueueRegistry.notification.sendSlack(
      `New audit cycle ${payload.auditId} initiated for department ${payload.departmentId} by user ${payload.creatorId}.`
    );
  }

  /**
   * Simulates heavy CPU/IO bound file compilations (e.g. generating PDFs or massive CSV sheets)
   */
  private async handleGenerateReport(
    job: Job<GenerateAuditReportPayload>
  ): Promise<void> {
    const payload = job.data;
    logger.info(
      { auditId: payload.auditId, format: payload.format },
      `Starting generation of audit report in ${payload.format} format...`
    );

    // Simulate heavy calculation delay (e.g. 5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Simulated output storage link
    const fileUrl = `https://storage.assetflow.com/reports/audit-${payload.auditId}.${payload.format.toLowerCase()}`;

    logger.info(
      { auditId: payload.auditId, fileUrl },
      `Successfully generated report file`
    );

    // Dispatch email notification containing download URL
    await QueueRegistry.notification.sendEmail(
      payload.recipientEmail,
      `Your Audit Report is Ready!`,
      "audit_report_ready",
      {
        auditId: payload.auditId,
        format: payload.format,
        downloadUrl: fileUrl,
      }
    );
  }
}
export default AuditProcessor;
