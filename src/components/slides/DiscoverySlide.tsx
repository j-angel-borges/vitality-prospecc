
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

  const bgImages = [
    PlaceHolderImages.find(img => img.id === "bg-discovery-1"),
    PlaceHolderImages.find(img => img.id === "bg-discovery-2"),
    PlaceHolderImages.find(img => img.id === "bg-discovery-3"),
  ]

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden animate-in fade-in duration-500">
      {/* Background Image with Overlay */}
      {bgImages[subStep] && (
        <>
          <Image
            src={bgImages[subStep]!.imageUrl}
            alt={bgImages[subStep]!.description}
            fill
            className="object-cover transition-opacity duration-1000"
            data-ai-hint={bgImages[subStep]!.imageHint}
          />
          <div className="absolute inset-0 bg-primary/60 backdrop-blur-[2px]" />
        </>
      )}

      {/* Navigation Header */}
      <div className="relative z-20 p-6 flex items-center shrink-0">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack} 
          className={cn("text-white hover:bg-white/20", subStep === 0 && "invisible")}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <div className="flex-1 text-center">
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === subStep ? 'w-10 bg-accent' : 'w-2 bg-white/40'
                )}
              />
            ))}
          </div>
        </div>
        <div className="w-10" />
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-12 flex items-center justify-center">
        <div className="max-w-2xl w-full space-y-8 md:space-y-12">
          {subStep === 0 && (
            <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-8">
              <h2 className="text-3xl md:text-5xl font-bold text-white text-center leading-tight drop-shadow-md">
                ¿Del 1 al 10 qué tan importante es la salud en su hogar?
              </h2>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <Button
                    key={num}
                    onClick={() => handleScoreClick(num)}
                    variant={data.healthScore === num ? "default" : "outline"}
                    className={cn(
                      "h-14 md:h-24 text-xl md:text-3xl font-bold rounded-2xl transition-all active:scale-90 border-2",
                      data.healthScore === num 
                        ? "bg-accent text-accent-foreground border-accent scale-110 shadow-xl" 
                        : "border-white/40 text-white hover:bg-white/20"
                    )}
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {subStep === 1 && (
            <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-8">
              <h2 className="text-3xl md:text-5xl font-bold text-white text-center leading-tight drop-shadow-md">
                ¿Ha escuchado antes sobre la contaminación actual por microplásticos y metales pesados en la cocina?
              </h2>
              <Textarea
                placeholder="Escriba su respuesta aquí..."
                className="min-h-[180px] md:min-h-[250px] text-xl md:text-2xl rounded-2xl border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-accent focus:ring-accent p-6"
                value={data.pollutionAwareness}
                onChange={(e) => onUpdate({ pollutionAwareness: e.target.value })}
              />
              <Button 
                onClick={handleNext}
                disabled={!data.pollutionAwareness.trim()}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-16 md:h-24 text-2xl font-bold rounded-2xl shadow-2xl flex items-center justify-center gap-3"
              >
                Siguiente
                <ArrowRight className="h-8 w-8" />
              </Button>
            </div>
          )}

          {subStep === 2 && (
            <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-8">
              <h2 className="text-3xl md:text-5xl font-bold text-white text-center leading-tight drop-shadow-md">
                ¿Le interesaría saber cómo detectar la contaminación en su cocina y alimentos?
              </h2>
              <div className="flex flex-col gap-6 md:gap-8">
                <Button
                  onClick={() => { onUpdate({ interestInDetection: true }); handleNext(); }}
                  className="h-28 md:h-40 text-4xl font-bold rounded-3xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-2xl transition-all hover:scale-105 active:scale-95"
                >
                  SÍ
                </Button>
                <Button
                  onClick={() => { onUpdate({ interestInDetection: false }); handleNext(); }}
                  variant="outline"
                  className="h-20 md:h-32 text-3xl font-bold rounded-3xl border-2 border-white/40 text-white hover:bg-white/20 transition-all active:scale-95"
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
