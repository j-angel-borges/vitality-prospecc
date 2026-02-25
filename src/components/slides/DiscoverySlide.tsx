"use client"

import * as React from "react"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ArrowRight } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { LeadData } from "@/app/actions/leads"
import { cn } from "@/lib/utils"

interface DiscoverySlideProps {
  data: LeadData
  onUpdate: (data: Partial<LeadData>) => void
  onComplete: () => void
}

export function DiscoverySlide({ data, onUpdate, onComplete }: DiscoverySlideProps) {
  const [subStep, setSubStep] = useState(0)

  const handleNext = () => {
    if (subStep < 2) {
      setSubStep(subStep + 1)
    } else {
      onComplete()
    }
  }

  const handleBack = () => {
    if (subStep > 0) setSubStep(subStep - 1)
  }

  const handleScoreClick = (score: number) => {
    onUpdate({ healthScore: score })
    setSubStep(1)
  }

  const discoveryImages = [
    PlaceHolderImages.find(img => img.id === "discovery-1"),
    PlaceHolderImages.find(img => img.id === "discovery-2"),
    PlaceHolderImages.find(img => img.id === "discovery-3"),
  ]

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="p-4 flex items-center shrink-0">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack} 
          className={cn("text-primary", subStep === 0 && "invisible")}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex-1 text-center">
          <div className="flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === subStep ? 'w-8 bg-primary' : 'w-2 bg-muted'}`}
              />
            ))}
          </div>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6 max-w-4xl mx-auto w-full">
        <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden shadow-md">
          {discoveryImages[subStep] && (
            <Image
              src={discoveryImages[subStep]!.imageUrl}
              alt={discoveryImages[subStep]!.description}
              fill
              className="object-cover"
              data-ai-hint={discoveryImages[subStep]!.imageHint}
            />
          )}
        </div>

        <div className="space-y-6 md:space-y-10 py-4">
          {subStep === 0 && (
            <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-2xl md:text-4xl font-bold text-primary text-center">
                ¿Del 1 al 10 qué tan importante es la salud en su hogar?
              </h2>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <Button
                    key={num}
                    onClick={() => handleScoreClick(num)}
                    variant={data.healthScore === num ? "default" : "outline"}
                    className={cn(
                      "h-14 md:h-20 text-lg md:text-2xl font-bold rounded-xl transition-all active:scale-90",
                      data.healthScore === num ? "bg-primary text-white" : "border-primary text-primary hover:bg-primary/5"
                    )}
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {subStep === 1 && (
            <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 max-w-2xl mx-auto w-full">
              <h2 className="text-2xl md:text-4xl font-bold text-primary text-center">
                ¿Ha escuchado antes sobre la contaminación por microplásticos y metales pesados en la cocina?
              </h2>
              <Textarea
                placeholder="Escriba su respuesta aquí..."
                className="min-h-[150px] text-lg md:text-xl rounded-xl border-primary/20 focus:border-primary p-4"
                value={data.pollutionAwareness}
                onChange={(e) => onUpdate({ pollutionAwareness: e.target.value })}
              />
              <Button 
                onClick={handleNext}
                disabled={!data.pollutionAwareness.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-white h-16 md:h-20 text-xl font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                Siguiente
                <ArrowRight className="h-6 w-6" />
              </Button>
            </div>
          )}

          {subStep === 2 && (
            <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 max-w-2xl mx-auto w-full">
              <h2 className="text-2xl md:text-4xl font-bold text-primary text-center">
                ¿Le interesaría saber cómo detectar la contaminación en su cocina y alimentos?
              </h2>
              <div className="flex flex-col gap-4 md:gap-6">
                <Button
                  onClick={() => { onUpdate({ interestInDetection: true }); handleNext(); }}
                  className="h-24 md:h-32 text-3xl font-bold rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl transition-all active:scale-95"
                >
                  SÍ
                </Button>
                <Button
                  onClick={() => { onUpdate({ interestInDetection: false }); handleNext(); }}
                  variant="outline"
                  className="h-24 md:h-32 text-3xl font-bold rounded-2xl border-2 border-primary text-primary hover:bg-primary/5 transition-all active:scale-95"
                >
                  NO
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
