
import { LeadWizard } from "@/components/LeadWizard";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <main className="min-h-svh w-full relative bg-background flex justify-center">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl h-full bg-white shadow-2xl relative">
        <LeadWizard />
      </div>
      <Toaster />
    </main>
  );
}
