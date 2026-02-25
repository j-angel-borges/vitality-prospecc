"use client"

import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  const formHeaderImage = PlaceHolderImages.find(img => img.id === "form-header")

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
    <div className="flex flex-col h-full bg-white animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="relative h-48 md:h-64 flex flex-col justify-end p-6 md:p-12 text-white shrink-0 overflow-hidden">
        {formHeaderImage && (
          <Image
            src={formHeaderImage.imageUrl}
            alt={formHeaderImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={formHeaderImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-primary/75" />
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold">Datos del Prospecto</h2>
          <p className="text-primary-foreground/90 text-lg md:text-2xl">Completa la información básica</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base md:text-lg font-semibold">Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Juan Pérez" {...field} className="h-14 md:h-16 text-lg bg-muted/30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base md:text-lg font-semibold">Número de Celular</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="987 654 321" 
                        {...field} 
                        className="h-14 md:h-16 text-lg bg-muted/30" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base md:text-lg font-semibold">Distrito</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Miraflores" {...field} className="h-14 md:h-16 text-lg bg-muted/30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salesRep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base md:text-lg font-semibold">Vendedor / Encargado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 md:h-16 text-lg bg-muted/30">
                          <SelectValue placeholder="Seleccione un encargado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Vendedor 1">Vendedor 1</SelectItem>
                        <SelectItem value="Vendedor 2">Vendedor 2</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-6 md:pt-10">
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white h-16 md:h-20 text-xl font-bold rounded-xl shadow-lg transition-all active:scale-95"
              >
                Siguiente
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
