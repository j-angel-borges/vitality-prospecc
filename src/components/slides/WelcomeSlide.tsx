
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
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white">
      <div className="relative w-full aspect-[4/3] shrink-0">
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
        <h1 className="text-3xl font-headline font-bold text-primary leading-tight">
          Descubre una Experiencia Culinaria única en Perú
        </h1>
        
        <div className="space-y-4">
          <ul className="text-xl text-muted-foreground font-medium space-y-3">
            <li className="flex items-center justify-center gap-3">
              <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
              Contaminación Cruzada.
            </li>
            <li className="flex items-center justify-center gap-3">
              <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
              Alimentación Saludable.
            </li>
          </ul>
        </div>

        <Button 
          onClick={onStart}
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-xl px-12 py-8 rounded-full shadow-lg transition-transform active:scale-95 mt-4 w-full"
        >
          COMENZAR
        </Button>
      </div>
    </div>
  )
}
