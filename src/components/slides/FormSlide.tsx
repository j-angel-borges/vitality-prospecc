
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
        <div className="w-full max-w-5xl px-6 py-10 md:py-16 text-white text-center shrink-0">
          <h2 className="text-4xl md:text-6xl lg:text-8xl font-bold mb-4 drop-shadow-2xl">Información de Registro</h2>
          <p className="text-white/90 text-xl md:text-2xl lg:text-4xl drop-shadow-lg">Completa tus datos de contacto</p>
        </div>

        <div className="w-full max-w-4xl px-6 pb-16">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-10 bg-white/95 p-6 md:p-12 lg:p-20 rounded-3xl md:rounded-[3rem] shadow-2xl backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-16">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg md:text-2xl lg:text-3xl font-bold text-primary">Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Juan Pérez" {...field} className="h-14 md:h-18 lg:h-24 text-lg md:text-2xl lg:text-3xl bg-white border-primary/20 rounded-xl md:rounded-2xl p-4 md:p-6" />
                      </FormControl>
                      <FormMessage className="text-sm md:text-lg" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg md:text-2xl lg:text-3xl font-bold text-primary">Número de Celular</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder="987 654 321" 
                          {...field} 
                          className="h-14 md:h-18 lg:h-24 text-lg md:text-2xl lg:text-3xl bg-white border-primary/20 rounded-xl md:rounded-2xl p-4 md:p-6" 
                        />
                      </FormControl>
                      <FormMessage className="text-sm md:text-lg" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg md:text-2xl lg:text-3xl font-bold text-primary">Distrito</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Miraflores" {...field} className="h-14 md:h-18 lg:h-24 text-lg md:text-2xl lg:text-3xl bg-white border-primary/20 rounded-xl md:rounded-2xl p-4 md:p-6" />
                      </FormControl>
                      <FormMessage className="text-sm md:text-lg" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salesRep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg md:text-2xl lg:text-3xl font-bold text-primary">Encargado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 md:h-18 lg:h-24 text-lg md:text-2xl lg:text-3xl bg-white border-primary/20 rounded-xl md:rounded-2xl px-4 md:px-6">
                            <SelectValue placeholder="Seleccione un encargado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Jose Angel" className="text-base md:text-xl lg:text-2xl p-2 md:p-4">Jose Angel</SelectItem>
                          <SelectItem value="Ricfel" className="text-base md:text-xl lg:text-2xl p-2 md:p-4">Ricfel</SelectItem>
                          <SelectItem value="Faviana" className="text-base md:text-xl lg:text-2xl p-2 md:p-4">Faviana</SelectItem>
                          <SelectItem value="Matías" className="text-base md:text-xl lg:text-2xl p-2 md:p-4">Matías</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-sm md:text-lg" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-6 md:pt-10">
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white h-16 md:h-24 lg:h-32 text-2xl md:text-3xl lg:text-4xl font-bold rounded-2xl md:rounded-[2rem] shadow-xl transition-all hover:scale-[1.02] active:scale-95"
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
