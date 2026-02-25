import { LeadWizard } from "@/components/LeadWizard";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <main className="min-h-svh w-full max-w-2xl mx-auto relative bg-background md:shadow-2xl md:my-4 md:rounded-3xl md:overflow-hidden md:border border-border/50">
      <LeadWizard />
      <Toaster />
    </main>
  );
}
