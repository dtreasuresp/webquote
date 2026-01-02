import { prisma } from '@/lib/prisma';
import { ApprovalStatus, QuotationConfig } from '@prisma/client';

export class AutomationService {
  /**
   * Evaluates automation rules for a given quotation.
   */
  static async evaluateRules(quotationId: string) {
    try {
      const quotation = await prisma.quotationConfig.findUnique({
        where: { id: quotationId },
        include: { snapshots: true },
      });

      if (!quotation) return;

      const activeRules = await prisma.automationRule.findMany({
        where: { active: true },
      });

      for (const rule of activeRules) {
        if (this.checkConditions(quotation, rule.conditions)) {
          await this.executeActions(quotation, rule.actions);
        }
      }
    } catch (error) {
      console.error('Error in AutomationService:', error);
    }
  }

  private static checkConditions(quotation: any, conditions: any): boolean {
    // Simple condition evaluation logic
    // Example conditions: { "total": { "gt": 10000 } }
    try {
      for (const [field, criteria] of Object.entries(conditions)) {
        const value = quotation[field];
        if (typeof criteria === 'object' && criteria !== null) {
          for (const [op, target] of Object.entries(criteria)) {
            if (op === 'gt' && !(Number(value) > Number(target))) return false;
            if (op === 'lt' && !(Number(value) < Number(target))) return false;
            if (op === 'eq' && value !== target) return false;
          }
        } else if (value !== criteria) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error checking conditions:', error);
      return false;
    }
  }

  private static async executeActions(quotation: QuotationConfig, actions: any) {
    try {
      // Example actions: { "requireApproval": true, "approverRole": "MANAGER" }
      if (actions.requireApproval) {
        await prisma.quotationConfig.update({
          where: { id: quotation.id },
          data: { approvalStatus: 'PENDING' },
        });

        await prisma.approvalFlow.create({
          data: {
            quotationConfigId: quotation.id,
            approverRole: actions.approverRole || 'ADMIN',
            status: 'PENDING',
          },
        });
      }
    } catch (error) {
      console.error('Error executing automation actions:', error);
    }
  }
}
