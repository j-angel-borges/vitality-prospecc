"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Send } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { LeadData } from "@/app/actions/leads"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useUser, errorEmitter, FirestorePermissionError } from "@/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

interface ActionSlideProps {
  data: LeadData
  onUpdate: (data: Partial<LeadData>) => void
  onSuccess: () => void
}

export function ActionSlide({ data, onUpdate, onSuccess }: ActionSlideProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const db = useFirestore()
  const { user } = useUser()

  const bgImage = PlaceHolderImages.find(img => img.id === "bg-action")
  
  // Logic to select the correct QR code mapping
  const getQrId = (name: string) => {
    switch(name) {
      case "Jose Angel": return "qr-jose-angel";
      case "Ricfel": return "qr-ricfel";
      case "Faviana": return "qr-faviana";
      case "Matías": return "qr-matias";
      default: return "qr-jose-angel";
    }
  }

  const qrImage = PlaceHolderImages.find(img => img.id === getQrId(data.salesRep))

  const handleFinish = async () => {
    if (!db || !user) {
      toast({
        variant: "destructive",
        title: "Error de sesión",
        description: "No se pudo identificar al encargado. Por favor, reintente.",
      })
      return
    }

    setIsSubmitting(true)

    const leadsRef = collection(db, "leads")
    const payload = {
      ...data,
      nombreMadre: data.fullName,
      celular: data.phoneNumber,
      distrito: data.district,
      observaciones: data.notes || '',
      sheetTab: 'Prospecc',
      estadoCrm: 'nuevo',
      salesRepUid: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    addDoc(leadsRef, payload)
      .then(() => {
        setIsSubmitting(false)
        onSuccess()
      })
      .catch(async (error) => {
        setIsSubmitting(false)
        const permissionError = new FirestorePermissionError({
          path: leadsRef.path,
          operation: 'create',
          requestResourceData: payload,
        })
        errorEmitter.emit('permission-error', permissionError)
      })
  }

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden animate-in fade-in duration-500">
      {bgImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={bgImage.imageUrl}
            alt={bgImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={bgImage.imageHint}
          />
          <div className="absolute inset-0 bg-primary/60 backdrop-blur-[2px]" />
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full">
        <div className="p-4 sm:p-6 md:p-10 text-white text-center shrink-0">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold drop-shadow-2xl">Acción Final</h2>
          <p className="text-white/90 text-sm sm:text-lg md:text-xl drop-shadow-lg">Encargado: {data.salesRep}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col items-center justify-center">
          <div className="bg-white/95 p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-2xl max-w-xl w-full space-y-6 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-3 sm:space-y-4">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 border-3 sm:border-4 border-primary rounded-2xl overflow-hidden p-2 sm:p-3 bg-white shadow-xl transition-transform hover:scale-105">
                {qrImage && (
                  <Image
                    src={qrImage.imageUrl}
                    alt={`Código QR de ${data.salesRep}`}
                    fill
                    className="object-contain p-2 sm:p-4"
                    data-ai-hint={qrImage.imageHint}
                  />
                )}
              </div>
              <p className="text-center font-bold text-primary text-base sm:text-lg md:text-xl">
                Escanea para agregarme a contactos
              </p>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="notes" className="text-sm sm:text-base md:text-lg font-bold text-primary block">
                Notas Adicionales
              </Label>
              <Textarea
                id="notes"
                placeholder="Escribe detalles importantes aquí..."
                className="min-h-[80px] sm:min-h-[110px] md:min-h-[140px] text-sm sm:text-base p-3 sm:p-4 bg-white border-primary/20 rounded-xl shadow-inner focus:border-accent"
                value={data.notes}
                onChange={(e) => onUpdate({ notes: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 shrink-0 max-w-xl mx-auto w-full">
          <Button
            onClick={handleFinish}
            disabled={isSubmitting}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-13 sm:h-16 md:h-18 text-lg sm:text-2xl font-bold rounded-xl sm:rounded-2xl shadow-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
          >
            {isSubmitting ? (
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
            ) : (
              <>
                <Send className="h-6 w-6 sm:h-8 sm:w-8" />
                FINALIZAR Y ENVIAR
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
