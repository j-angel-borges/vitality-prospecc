
"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { PlaceHolderImages } from "@/lib/placeholder-images"

interface WelcomeSlideProps {
  onStart: () => void
}

export function WelcomeSlide({ onStart }: WelcomeSlideProps) {
  const heroImage = PlaceHolderImages.find(img => img.id === "welcome-hero")

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative w-full aspect-video">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
        <h1 className="text-4xl font-headline font-bold text-primary leading-tight">
          Descubre una nueva experiencia
        </h1>
        <p className="text-muted-foreground max-w-xs">
          Comienza tu viaje con ProspectFlow y gestiona tus contactos de manera eficiente.
        </p>
        <Button 
          onClick={onStart}
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-12 py-8 rounded-full shadow-lg transition-transform active:scale-95"
        >
          COMENZAR
        </Button>
      </div>
    </div>
  )
}
