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
      case "Jangel":
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
        <div className="p-3 sm:p-6 text-white text-center shrink-0">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold drop-shadow-2xl">Acción Final</h2>
          <p className="text-white/90 text-xs sm:text-base drop-shadow-lg">Encargado: {data.salesRep}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col items-center justify-center">
          <div className="bg-white/95 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full space-y-4 sm:space-y-6 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-2 sm:space-y-3">
              <div className="relative w-32 h-32 sm:w-44 sm:h-44 border-2 sm:border-3 border-primary rounded-xl overflow-hidden p-2 sm:p-3 bg-white shadow-lg transition-transform hover:scale-105">
                {qrImage && (
                  <Image
                    src={qrImage.imageUrl}
                    alt={`Código QR de ${data.salesRep}`}
                    fill
                    className="object-contain p-1.5 sm:p-3"
                    data-ai-hint={qrImage.imageHint}
                  />
                )}
              </div>
              <p className="text-center font-bold text-primary text-xs sm:text-base">
                Escanea para agregarme a contactos
              </p>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="notes" className="text-xs sm:text-sm font-bold text-primary block">
                Notas Adicionales
              </Label>
              <Textarea
                id="notes"
                placeholder="Escribe detalles importantes aquí..."
                className="min-h-[70px] sm:min-h-[90px] text-xs sm:text-sm p-2.5 sm:p-3 bg-white border-primary/20 rounded-xl shadow-inner focus:border-accent"
                value={data.notes}
                onChange={(e) => onUpdate({ notes: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-5 shrink-0 max-w-md mx-auto w-full">
          <Button
            onClick={handleFinish}
            disabled={isSubmitting}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-12 sm:h-14 text-sm sm:text-lg font-bold rounded-xl sm:rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                FINALIZAR Y ENVIAR
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
