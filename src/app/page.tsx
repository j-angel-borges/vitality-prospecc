import { LeadWizard } from "@/components/LeadWizard";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <main className="min-h-svh w-full relative bg-background">
      <LeadWizard />
      <Toaster />
    </main>
  );
}
