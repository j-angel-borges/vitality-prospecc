
import { LeadWizard } from "@/components/LeadWizard";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <main className="min-h-svh max-w-md mx-auto relative bg-background shadow-2xl">
      <LeadWizard />
      <Toaster />
    </main>
  );
}
