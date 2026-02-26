
import { LeadWizard } from "@/components/LeadWizard";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <main className="min-h-svh w-full relative bg-background flex justify-center overflow-hidden">
      <div className="w-full h-full relative">
        <LeadWizard />
      </div>
      <Toaster />
    </main>
  );
}
