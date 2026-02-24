
"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, UserPlus } from "lucide-react"

interface SuccessSlideProps {
  onReset: () => void
}

export function SuccessSlide({ onReset }: SuccessSlideProps) {
  return (
    <div className="flex flex-col h-full items-center justify-center p-8 bg-white text-center space-y-8 animate-in zoom-in duration-500">
      <div className="rounded-full bg-green-100 p-6 animate-bounce">
        <CheckCircle2 className="h-20 w-20 text-green-600" />
      </div>
      
      <div className="space-y-4">
        <h1 className="text-4xl font-headline font-bold text-primary">
          ¡Felicidades!
        </h1>
        <p className="text-xl text-muted-foreground max-w-xs mx-auto">
          El prospecto ha sido registrado exitosamente en nuestro sistema.
        </p>
      </div>

      <Button 
        onClick={onReset}
        className="bg-primary hover:bg-primary/90 text-white font-bold text-lg px-8 py-8 rounded-2xl shadow-xl flex items-center gap-3 w-full max-w-xs transition-transform active:scale-95"
      >
        <UserPlus className="h-6 w-6" />
        NUEVO PROSPECTO
      </Button>
    </div>
  )
}
