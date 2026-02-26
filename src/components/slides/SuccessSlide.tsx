
"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CheckCircle2, UserPlus } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images"

interface SuccessSlideProps {
  onReset: () => void
}

export function SuccessSlide({ onReset }: SuccessSlideProps) {
  const bgImage = PlaceHolderImages.find(img => img.id === "bg-success")

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden animate-in zoom-in duration-700">
      {/* Background Image with Overlay */}
      {bgImage && (
        <>
          <Image
            src={bgImage.imageUrl}
            alt={bgImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={bgImage.imageHint}
          />
          <div className="absolute inset-0 bg-primary/60 backdrop-blur-[2px]" />
        </>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 md:p-16 text-center space-y-12">
        <div className="rounded-full bg-accent/20 p-10 animate-bounce">
          <CheckCircle2 className="h-32 w-32 text-accent" />
        </div>
        
        <div className="space-y-6 max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-headline font-bold text-white drop-shadow-lg">
            ¡Felicidades!
          </h1>
          <p className="text-2xl md:text-4xl text-white/90 font-medium leading-relaxed drop-shadow-md">
            El prospecto ha sido registrado exitosamente en nuestro sistema.
          </p>
        </div>

        <Button 
          onClick={onReset}
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-2xl md:text-3xl px-12 py-10 rounded-3xl shadow-2xl flex items-center gap-4 w-full max-w-md transition-all hover:scale-105 active:scale-95 mt-8"
        >
          <UserPlus className="h-8 w-8 md:h-10 md:h-10" />
          NUEVO PROSPECTO
        </Button>
      </div>
    </div>
  )
}
