import { adminDb } from "@/lib/firebase/admin";

export interface AuditLog {
  action: string;
  userId: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
}

export class AuditRepository {
  private static collection = "audit_logs";

  /**
   * Logs an administrative action to the audit logs collection (Server-side only)
   */
  static async logAction(log: AuditLog) {
    if (!adminDb) {
      console.warn("Audit log skipped: adminDb not initialized.");
      return;
    }

    try {
      await adminDb.collection(this.collection).add({
        ...log,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Failed to write audit log:", error);
    }
  }
}
