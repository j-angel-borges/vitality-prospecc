
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

  const currentBg = bgImages[subStep]

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden animate-in fade-in duration-500">
      {/* Background Image/GIF with 60% Blue Overlay */}
      {currentBg && (
        <div className="absolute inset-0 z-0">
          <Image
            src={currentBg.imageUrl}
            alt={currentBg.description}
            fill
            className="object-cover transition-opacity duration-1000"
            priority
            data-ai-hint={currentBg.imageHint}
          />
          <div className="absolute inset-0 bg-primary/60 backdrop-blur-[3px]" />
        </div>
      )}

      {/* Navigation Header - Fixed at top */}
      <div className="relative z-20 p-4 md:p-8 flex items-center shrink-0">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack} 
          className={cn("text-white hover:bg-white/20 h-10 w-10 md:h-12 md:w-12", subStep === 0 && "invisible")}
        >
          <ChevronLeft className="h-8 w-8 md:h-10 md:h-10" />
        </Button>
        <div className="flex-1 text-center">
          <div className="flex justify-center gap-2 md:gap-3">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className={cn(
                  "h-2 md:h-3 rounded-full transition-all duration-300 shadow-sm",
                  i === subStep ? 'w-12 md:w-16 bg-accent' : 'w-2 md:w-3 bg-white/40'
                )}
              />
            ))}
          </div>
        </div>
        <div className="w-10 md:w-12" />
      </div>

      {/* Scrollable Content Area */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 md:px-12 pb-8 flex items-center justify-center">
        <div className="max-w-4xl w-full py-4">
          {subStep === 0 && (
            <div className="space-y-8 md:space-y-16 animate-in fade-in slide-in-from-bottom-8">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white text-center leading-tight drop-shadow-2xl">
                ¿Del 1 al 10 qué tan importante es la salud en su hogar?
              </h2>
              <div className="grid grid-cols-5 md:grid-cols-5 lg:grid-cols-10 gap-2 md:gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <Button
                    key={num}
                    onClick={() => handleScoreClick(num)}
                    variant={data.healthScore === num ? "default" : "outline"}
                    className={cn(
                      "h-16 md:h-24 lg:h-32 text-xl md:text-3xl lg:text-4xl font-bold rounded-2xl md:rounded-3xl transition-all active:scale-90 border-2 md:border-4",
                      data.healthScore === num 
                        ? "bg-accent text-accent-foreground border-accent scale-105 md:scale-110 shadow-2xl" 
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
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white text-center leading-tight drop-shadow-2xl">
                ¿Ha escuchado antes sobre la contaminación actual por microplásticos y metales pesados en la cocina?
              </h2>
              <Textarea
                placeholder="Escriba su respuesta aquí..."
                className="min-h-[180px] md:min-h-[250px] lg:min-h-[350px] text-xl md:text-3xl lg:text-4xl rounded-2xl md:rounded-3xl border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-accent focus:ring-accent p-6 md:p-10 backdrop-blur-md shadow-inner"
                value={data.pollutionAwareness}
                onChange={(e) => onUpdate({ pollutionAwareness: e.target.value })}
              />
              <Button 
                onClick={handleNext}
                disabled={!data.pollutionAwareness.trim()}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-16 md:h-24 lg:h-32 text-2xl md:text-3xl lg:text-4xl font-bold rounded-2xl md:rounded-3xl shadow-2xl flex items-center justify-center gap-3 md:gap-4 transition-all hover:scale-105"
              >
                Siguiente
                <ArrowRight className="h-8 w-8 md:h-10 md:h-10" />
              </Button>
            </div>
          )}

          {subStep === 2 && (
            <div className="space-y-8 md:space-y-16 animate-in fade-in slide-in-from-bottom-8">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white text-center leading-tight drop-shadow-2xl">
                ¿Le interesaría saber cómo detectar la contaminación en su cocina y alimentos?
              </h2>
              <div className="flex flex-col gap-6 md:gap-8 lg:gap-12">
                <Button
                  onClick={() => { onUpdate({ interestInDetection: true }); handleNext(); }}
                  className="h-24 md:h-36 lg:h-52 text-4xl md:text-5xl lg:text-7xl font-bold rounded-[2rem] md:rounded-[3rem] bg-accent hover:bg-accent/90 text-accent-foreground shadow-2xl transition-all hover:scale-105 active:scale-95"
                >
                  SÍ
                </Button>
                <Button
                  onClick={() => { onUpdate({ interestInDetection: false }); handleNext(); }}
                  variant="outline"
                  className="h-16 md:h-24 lg:h-36 text-3xl md:text-4xl lg:text-6xl font-bold rounded-[2rem] md:rounded-[3rem] border-2 md:border-4 border-white/40 text-white hover:bg-white/20 transition-all active:scale-95"
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
