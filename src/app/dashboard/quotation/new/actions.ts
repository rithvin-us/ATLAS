'use server';

import { z } from 'zod';
import { validateQuotationFeasibility, ValidateQuotationFeasibilityOutput } from '@/ai/flows/validate-quotation-feasibility';

const QuotationFormSchema = z.object({
  scopeOfWork: z.string({ required_error: 'Scope of work is required.' }).min(10, 'Please provide a more detailed scope of work.'),
  siteDetails: z.string().min(10, 'Please provide more detailed site details.'),
  safetyGuidelines: z.string().min(10, 'Please provide more detailed safety guidelines.'),
  prerequisites: z.string().min(10, 'Please provide more detailed prerequisites.'),
  vendorPaymentPolicies: z.string().min(10, 'Please provide more detailed vendor payment policies.'),
  materialCost: z.coerce.number({ required_error: 'Material cost is required.' }).positive('Material cost must be a positive number.'),
  supplyCost: z.coerce.number({ required_error: 'Supply cost is required.' }).positive('Supply cost must be a positive number.'),
  serviceCost: z.coerce.number({ required_error: 'Service cost is required.' }).positive('Service cost must be a positive number.'),
  executionPlan: z.string().min(10, 'Please provide a more detailed execution plan.'),
  timeFlow: z.string().min(10, 'Please provide a more detailed time flow.'),
  paymentSchedule: z.string().min(10, 'Please provide a more detailed payment schedule.'),
  historicalData: z.string().optional(),
  credibilityScore: z.coerce.number({ required_error: 'Credibility score is required.' }).min(0, 'Credibility score must be between 0 and 100.').max(100, 'Credibility score must be between 0 and 100.'),
});

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: z.ZodIssue[];
  data?: ValidateQuotationFeasibilityOutput;
} | null;

export async function analyzeQuotation(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = QuotationFormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please correct the errors and try again.',
      issues: validatedFields.error.issues,
    };
  }

  try {
    const result = await validateQuotationFeasibility({
        ...validatedFields.data,
        historicalData: validatedFields.data.historicalData || 'No historical data provided.'
    });
    return { message: 'Analysis complete.', data: result };
  } catch (error) {
    console.error(error);
    return { message: 'An error occurred during AI analysis. Please try again later.' };
  }
}
