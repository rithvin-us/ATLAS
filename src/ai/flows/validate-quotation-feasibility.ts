'use server';

/**
 * @fileOverview This file defines a Genkit flow for validating the feasibility of a contractor's quotation and execution plan.
 *
 * - validateQuotationFeasibility - The main function to validate the quotation feasibility.
 * - ValidateQuotationFeasibilityInput - The input type for the validateQuotationFeasibility function.
 * - ValidateQuotationFeasibilityOutput - The output type for the validateQuotationFeasibility function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateQuotationFeasibilityInputSchema = z.object({
  scopeOfWork: z.string().describe('Detailed scope of work for the project.'),
  siteDetails: z.string().describe('Details about the site or plant where the work will be performed.'),
  safetyGuidelines: z.string().describe('Safety guidelines and code of conduct for the project.'),
  prerequisites: z.string().describe('Prerequisites and certifications required for the project.'),
  vendorPaymentPolicies: z.string().describe('Vendor payment and invoicing policies.'),
  materialCost: z.number().describe('The estimated cost of materials for the project.'),
  supplyCost: z.number().describe('The estimated cost of supplies for the project.'),
  serviceCost: z.number().describe('The estimated cost of services for the project.'),
  executionPlan: z.string().describe('Detailed execution plan for the project.'),
  timeFlow: z.string().describe('Time-flow and milestone breakdown for the project.'),
  paymentSchedule: z.string().describe('Proposed payment schedule aligned with agent policies.'),
  historicalData: z.string().describe('Historical data of similar projects, if available.'),
  credibilityScore: z.number().describe('The credibility score of the contractor.'),
});

export type ValidateQuotationFeasibilityInput = z.infer<
  typeof ValidateQuotationFeasibilityInputSchema
>;

const ValidateQuotationFeasibilityOutputSchema = z.object({
  isFeasible: z.boolean().describe('A boolean indicating whether the quotation is feasible.'),
  isCompetitive: z.boolean().describe('A boolean indicating whether the quotation is competitive.'),
  recommendation: z
    .string()
    .describe(
      'A recommendation of whether to submit the quotation (go/no-go) and suggestions for improvement.'
    ),
  feasibilityScore: z.number().describe('A score indicating the feasibility of the quotation.'),
  competitivenessScore: z
    .number()
    .describe('A score indicating the competitiveness of the quotation.'),
});

export type ValidateQuotationFeasibilityOutput = z.infer<
  typeof ValidateQuotationFeasibilityOutputSchema
>;

export async function validateQuotationFeasibility(
  input: ValidateQuotationFeasibilityInput
): Promise<ValidateQuotationFeasibilityOutput> {
  return validateQuotationFeasibilityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateQuotationFeasibilityPrompt',
  input: {schema: ValidateQuotationFeasibilityInputSchema},
  output: {schema: ValidateQuotationFeasibilityOutputSchema},
  prompt: `You are an AI expert in project management, cost estimation, and risk assessment. Your role is to evaluate the feasibility and competitiveness of a contractor's quotation and execution plan for a given project. Based on the information provided, you will determine whether the quotation is feasible and competitive, provide a recommendation (go/no-go), and suggest improvements.

Here is the project information:
Scope of Work: {{{scopeOfWork}}}
Site Details: {{{siteDetails}}}
Safety Guidelines: {{{safetyGuidelines}}}
Prerequisites: {{{prerequisites}}}
Vendor Payment Policies: {{{vendorPaymentPolicies}}}

Here is the contractor's quotation and execution plan:
Material Cost: {{{materialCost}}}
Supply Cost: {{{supplyCost}}}
Service Cost: {{{serviceCost}}}
Execution Plan: {{{executionPlan}}}
Time-flow and Milestone Breakdown: {{{timeFlow}}}
Payment Schedule: {{{paymentSchedule}}}

Historical Data (if available): {{{historicalData}}}
Contractor Credibility Score: {{{credibilityScore}}}

Based on this information, provide a structured JSON output including:
- isFeasible: true/false (Is the quotation feasible based on the provided information?)
- isCompetitive: true/false (Is the quotation competitive compared to market standards and historical data?)
- recommendation: A concise recommendation of whether to submit the quotation (go/no-go) and 1-2 brief suggestions for improvement.
- feasibilityScore: A numerical score (0-100) indicating the feasibility of the quotation.
- competitivenessScore: A numerical score (0-100) indicating the competitiveness of the quotation.

Ensure that your output adheres to the JSON schema defined for ValidateQuotationFeasibilityOutput. Give concrete reasons for your recommendation.
`,
});

const validateQuotationFeasibilityFlow = ai.defineFlow(
  {
    name: 'validateQuotationFeasibilityFlow',
    inputSchema: ValidateQuotationFeasibilityInputSchema,
    outputSchema: ValidateQuotationFeasibilityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
