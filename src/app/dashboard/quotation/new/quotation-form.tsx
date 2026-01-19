'use client';
import { useActionState, useEffect, useRef } from 'react';
import { analyzeQuotation, FormState } from './actions';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, TrendingUp, Sparkles, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

function SubmitButton() {
    // Note: this is a simplified version. For a real app, you would use useFormStatus.
    // However, react-dom's useFormStatus is not yet stable in React 19's canary channel with Next.js App Router.
    // A simple button is used here to avoid potential build issues.
    return (
        <Button type="submit" size="lg">
            <Sparkles className="mr-2 h-4 w-4" />
            Run AI Analysis
        </Button>
    );
}

const initialFormState: FormState = null;

export function QuotationForm() {
  const [state, formAction] = useActionState(analyzeQuotation, initialFormState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.message) {
      if (state.data || state.issues) {
        if (state.issues) {
            toast({
                title: "Validation Error",
                description: state.message,
                variant: "destructive",
            });
        } else if (state.data) {
            toast({
                title: "Analysis Complete",
                description: "The AI has finished analyzing your quotation.",
            });
            resultRef.current?.scrollIntoView({ behavior: 'smooth' });
            formRef.current?.reset();
        }
      } else {
         toast({
            title: "Error",
            description: state.message,
            variant: "destructive",
        });
      }
    }
  }, [state, toast]);
  

  return (
    <div className="space-y-8">
        <form ref={formRef} action={formAction} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Project & Policy Information</CardTitle>
                    <CardDescription>Provide the context provided by the agent/buyer for this RFQ.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="scopeOfWork">Scope of Work</Label>
                        <Textarea id="scopeOfWork" name="scopeOfWork" placeholder="e.g., Annual maintenance contract for 5-ton HVAC units..." rows={5} required />
                        {state?.issues?.find(issue => issue.path.includes('scopeOfWork')) && <p className="text-sm text-destructive">{state.issues.find(issue => issue.path.includes('scopeOfWork'))?.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="siteDetails">Site Details</Label>
                        <Textarea id="siteDetails" name="siteDetails" placeholder="e.g., Manufacturing plant in a high-humidity zone..." rows={5} required/>
                        {state?.issues?.find(issue => issue.path.includes('siteDetails')) && <p className="text-sm text-destructive">{state.issues.find(issue => issue.path.includes('siteDetails'))?.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="safetyGuidelines">Safety Guidelines</Label>
                        <Textarea id="safetyGuidelines" name="safetyGuidelines" placeholder="e.g., All personnel must wear PPE..." rows={5} required/>
                         {state?.issues?.find(issue => issue.path.includes('safetyGuidelines')) && <p className="text-sm text-destructive">{state.issues.find(issue => issue.path.includes('safetyGuidelines'))?.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="prerequisites">Prerequisites & Certifications</Label>
                        <Textarea id="prerequisites" name="prerequisites" placeholder="e.g., ISO 9001 certification required..." rows={5} required/>
                         {state?.issues?.find(issue => issue.path.includes('prerequisites')) && <p className="text-sm text-destructive">{state.issues.find(issue => issue.path.includes('prerequisites'))?.message}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="vendorPaymentPolicies">Vendor Payment Policies</Label>
                        <Textarea id="vendorPaymentPolicies" name="vendorPaymentPolicies" placeholder="e.g., Net-60 payment terms, invoices submitted monthly..." rows={3} required/>
                        {state?.issues?.find(issue => issue.path.includes('vendorPaymentPolicies')) && <p className="text-sm text-destructive">{state.issues.find(issue => issue.path.includes('vendorPaymentPolicies'))?.message}</p>}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Quotation & Cost Breakdown</CardTitle>
                    <CardDescription>Enter your proposed costs for this project.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-3">
                     <div className="space-y-2">
                        <Label htmlFor="materialCost">Material Cost ($)</Label>
                        <Input type="number" id="materialCost" name="materialCost" placeholder="e.g., 15000" required />
                        {state?.issues?.find(issue => issue.path.includes('materialCost')) && <p className="text-sm text-destructive">{state.issues.find(issue => issue.path.includes('materialCost'))?.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="supplyCost">Supply Cost ($)</Label>
                        <Input type="number" id="supplyCost" name="supplyCost" placeholder="e.g., 3000" required />
                        {state?.issues?.find(issue => issue.path.includes('supplyCost')) && <p className="text-sm text-destructive">{state.issues.find(issue => issue.path.includes('supplyCost'))?.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="serviceCost">Service Cost ($)</Label>
                        <Input type="number" id="serviceCost" name="serviceCost" placeholder="e.g., 8000" required />
                        {state?.issues?.find(issue => issue.path.includes('serviceCost')) && <p className="text-sm text-destructive">{state.issues.find(issue => issue.path.includes('serviceCost'))?.message}</p>}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Execution & Planning</CardTitle>
                    <CardDescription>Detail your plan for executing the project successfully.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="executionPlan">Detailed Execution Plan</Label>
                        <Textarea id="executionPlan" name="executionPlan" placeholder="e.g., Phase 1: Site survey and material procurement..." rows={5} required/>
                        {state?.issues?.find(issue => issue.path.includes('executionPlan')) && <p className="text-sm text-destructive">{state.issues.find(issue => issue.path.includes('executionPlan'))?.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="timeFlow">Time-flow & Milestone Breakdown</Label>
                        <Textarea id="timeFlow" name="timeFlow" placeholder="e.g., Week 1-2: Initial setup. Week 3: Mid-project review..." rows={5} required/>
                        {state?.issues?.find(issue => issue.path.includes('timeFlow')) && <p className="text-sm text-destructive">{state.issues.find(issue => issue.path.includes('timeFlow'))?.message}</p>}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="paymentSchedule">Proposed Payment Schedule</Label>
                        <Textarea id="paymentSchedule" name="paymentSchedule" placeholder="e.g., 30% upfront, 40% on milestone 2, 30% on completion..." rows={3} required/>
                        {state?.issues?.find(issue => issue.path.includes('paymentSchedule')) && <p className="text-sm text-destructive">{state.issues.find(issue => issue.path.includes('paymentSchedule'))?.message}</p>}
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Supporting Data</CardTitle>
                    <CardDescription>Provide any additional data that can help in the analysis.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="historicalData">Historical Data of Similar Projects (Optional)</Label>
                        <Textarea id="historicalData" name="historicalData" placeholder="e.g., Completed a similar project for XYZ Corp in 2023 with a budget of $25,000..." rows={5} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="credibilityScore">Your Current Credibility Score</Label>
                        <Input type="number" id="credibilityScore" name="credibilityScore" min="0" max="100" placeholder="e.g., 85" required/>
                        {state?.issues?.find(issue => issue.path.includes('credibilityScore')) && <p className="text-sm text-destructive">{state.issues.find(issue => issue.path.includes('credibilityScore'))?.message}</p>}
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitButton />
                </CardFooter>
            </Card>
        </form>

        {state?.data && (
            <div ref={resultRef}>
                <Card className="border-primary/50">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2"><Sparkles className="text-primary"/>AI Analysis Result</CardTitle>
                        <CardDescription>Here's the AI's assessment of your quotation.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className={`p-6 rounded-lg flex flex-col items-center justify-center text-center ${state.data.isFeasible ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                                {state.data.isFeasible ? <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mb-2"/> : <XCircle className="h-12 w-12 text-red-600 dark:text-red-400 mb-2"/>}
                                <h3 className="text-lg font-semibold">Feasibility</h3>
                                <p className="text-2xl font-bold">{state.data.isFeasible ? "Feasible" : "Not Feasible"}</p>
                            </div>
                             <div className={`p-6 rounded-lg flex flex-col items-center justify-center text-center ${state.data.isCompetitive ? 'bg-green-100 dark:bg-green-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'}`}>
                                {state.data.isCompetitive ? <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mb-2"/> : <AlertTriangle className="h-12 w-12 text-yellow-600 dark:text-yellow-400 mb-2"/>}
                                <h3 className="text-lg font-semibold">Competitiveness</h3>
                                <p className="text-2xl font-bold">{state.data.isCompetitive ? "Competitive" : "Less Competitive"}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <Label className="flex items-center gap-2"><TrendingUp className="h-4 w-4" />Feasibility Score</Label>
                                    <span className="font-bold">{state.data.feasibilityScore}/100</span>
                                </div>
                                <Progress value={state.data.feasibilityScore} />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <Label className="flex items-center gap-2"><TrendingUp className="h-4 w-4" />Competitiveness Score</Label>
                                    <span className="font-bold">{state.data.competitivenessScore}/100</span>
                                </div>
                                <Progress value={state.data.competitivenessScore} />
                            </div>
                        </div>

                        <div className="p-4 bg-secondary border-l-4 border-primary rounded-r-lg">
                            <h4 className="font-semibold flex items-center gap-2"><Info className="h-5 w-5 text-primary"/>AI Recommendation</h4>
                            <p className="text-secondary-foreground/90 mt-2">{state.data.recommendation}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}
    </div>
  );
}
