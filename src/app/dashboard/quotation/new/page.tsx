import { QuotationForm } from "./quotation-form";

export default function NewQuotationPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold font-headline tracking-tight">AI Quotation Analysis</h1>
                <p className="text-muted-foreground">Submit your quotation for an AI-powered feasibility and competitiveness analysis before you bid.</p>
            </div>
            <QuotationForm />
        </div>
    );
}
