"use client"

import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LeadData } from "@/app/actions/leads"
import { PlaceHolderImages } from "@/lib/placeholder-images"

const formSchema = z.object({
  fullName: z.string().min(3, "Nombre es muy corto"),
  phoneNumber: z.string().min(8, "Número de celular inválido"),
  district: z.string().min(2, "Distrito es requerido"),
  salesRep: z.string().min(1, "Seleccione un encargado"),
})

interface FormSlideProps {
  data: LeadData
  onUpdate: (data: Partial<LeadData>) => void
  onNext: () => void
}

export function FormSlide({ data, onUpdate, onNext }: FormSlideProps) {
  const bgImage = PlaceHolderImages.find(img => img.id === "bg-form")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      district: data.district,
      salesRep: data.salesRep,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    onUpdate(values)
    onNext()
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

      <div className="relative z-10 flex-1 overflow-y-auto flex flex-col items-center">
        <div className="w-full max-w-2xl px-4 py-4 sm:py-8 text-white text-center shrink-0">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-1 drop-shadow-2xl">
            Información de Registro
          </h2>
          <p className="text-white/90 text-xs sm:text-base drop-shadow-lg">
            Completa tus datos de contacto
          </p>
        </div>

        <div className="w-full max-w-xl px-4 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5 sm:space-y-6 bg-white/95 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-bold text-primary">Nombre Completo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej. Juan Pérez" 
                          {...field} 
                          className="h-11 sm:h-13 text-base sm:text-sm bg-white border-primary/20 rounded-xl px-3 sm:px-4" 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-bold text-primary">Número de Celular</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder="987 654 321" 
                          {...field} 
                          className="h-11 sm:h-13 text-base sm:text-sm bg-white border-primary/20 rounded-xl px-3 sm:px-4" 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-bold text-primary">Distrito</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej. Miraflores" 
                          {...field} 
                          className="h-11 sm:h-13 text-base sm:text-sm bg-white border-primary/20 rounded-xl px-3 sm:px-4" 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salesRep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-bold text-primary">Encargado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 sm:h-13 text-base sm:text-sm bg-white border-primary/20 rounded-xl px-3 sm:px-4">
                            <SelectValue placeholder="Seleccione un encargado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Jose Angel" className="text-sm p-2 sm:p-2.5">Jose Angel</SelectItem>
                          <SelectItem value="Ricfel" className="text-sm p-2 sm:p-2.5">Ricfel</SelectItem>
                          <SelectItem value="Faviana" className="text-sm p-2 sm:p-2.5">Faviana</SelectItem>
                          <SelectItem value="Matías" className="text-sm p-2 sm:p-2.5">Matías</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-2 sm:pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white h-12 sm:h-14 text-base sm:text-xl font-bold rounded-xl sm:rounded-2xl shadow-xl transition-all hover:scale-[1.01] active:scale-95"
                >
                  SIGUIENTE
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
