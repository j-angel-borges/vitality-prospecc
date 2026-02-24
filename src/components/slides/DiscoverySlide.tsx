
"use client"

import * as React from "react"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronLeft } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images"

interface DiscoverySlideProps {
  onComplete: () => void
}

const discoverySteps = [
  {
    imageId: "discovery-1",
    title: "Encuentra Prospectos",
    description: "Identifica nuevas oportunidades de negocio en tiempo real."
  },
  {
    imageId: "discovery-2",
    title: "Conecta con Expertos",
    description: "Nuestro equipo está listo para ayudarte a cerrar cada trato."
  },
  {
    imageId: "discovery-3",
    title: "Impulsa tu Crecimiento",
    description: "Monitorea tus avances y alcanza tus metas comerciales."
  }
]

export function DiscoverySlide({ onComplete }: DiscoverySlideProps) {
  const [step, setStep] = useState(0)

  const handleNext = () => {
    if (step < discoverySteps.length - 1) {
      setStep(step + 1)
    } else {
      onComplete()
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const currentData = discoverySteps[step]
  const currentImage = PlaceHolderImages.find(img => img.id === currentData.imageId)

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-300">
      <div className="p-4 flex items-center">
        {step > 0 && (
          <Button variant="ghost" size="icon" onClick={handleBack} className="text-primary">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
        <div className="flex-1 text-center">
          <div className="flex justify-center gap-1.5">
            {discoverySteps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : 'w-2 bg-muted'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 space-y-6">
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-md">
          {currentImage && (
            <Image
              src={currentImage.imageUrl}
              alt={currentImage.description}
              fill
              className="object-cover"
              data-ai-hint={currentImage.imageHint}
            />
          )}
        </div>

        <div className="text-center space-y-4 pt-4">
          <h2 className="text-2xl font-bold text-primary">{currentData.title}</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {currentData.description}
          </p>
        </div>
      </div>

      <div className="p-8">
        <Button 
          onClick={handleNext}
          className="w-full bg-secondary hover:bg-secondary/90 text-white h-14 text-lg font-semibold rounded-xl flex items-center justify-center gap-2 group"
        >
          {step === discoverySteps.length - 1 ? "Entendido" : "Siguiente"}
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  )
}
