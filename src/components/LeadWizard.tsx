"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { WelcomeSlide } from "./slides/WelcomeSlide"
import { DiscoverySlide } from "./slides/DiscoverySlide"
import { FormSlide } from "./slides/FormSlide"
import { ActionSlide } from "./slides/ActionSlide"
import { SuccessSlide } from "./slides/SuccessSlide"
import { FloatingHubHomeButton } from "./FloatingHubHomeButton"
import { LeadData } from "@/app/actions/leads"
import { useAuth, initiateAnonymousSignIn } from "@/firebase"

type Step = "welcome" | "discovery" | "form" | "action" | "success"

export function LeadWizard() {
  const auth = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>("welcome")
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [formData, setFormData] = useState<LeadData>({
    fullName: "",
    phoneNumber: "",
    district: "",
    salesRep: "",
    notes: "",
    healthScore: 5,
    pollutionAwareness: "",
    interestInDetection: false,
  })

  useEffect(() => {
    if (auth && !auth.currentUser) {
      initiateAnonymousSignIn(auth)
    }
  }, [auth])

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFsChange)
    return () => document.removeEventListener("fullscreenchange", handleFsChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen()
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        }
      }
    } catch (e) {
      console.warn("Fullscreen toggle note:", e)
    }
  }

  const handleRetroceder = () => {
    if (currentStep === "success") {
      setCurrentStep("action")
    } else if (currentStep === "action") {
      setCurrentStep("form")
    } else if (currentStep === "form") {
      setCurrentStep("discovery")
    } else if (currentStep === "discovery") {
      setCurrentStep("welcome")
    } else {
      window.location.href = "/"
    }
  }

  const nextStep = (step: Step) => setCurrentStep(step)
  
  const updateFormData = (data: Partial<LeadData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const resetWizard = () => {
    setFormData({
      fullName: "",
      phoneNumber: "",
      district: "",
      salesRep: "",
      notes: "",
      healthScore: 5,
      pollutionAwareness: "",
      interestInDetection: false,
    })
    setCurrentStep("welcome")
  }

  return (
    <div
      className="flex flex-col w-full bg-black overflow-hidden relative"
      style={{
        height: '100dvh',
        minHeight: '-webkit-fill-available'
      }}
    >
      {/* 3 Top-Right Persistent Action Buttons: Expandir, CRM, Retroceder (Pure SVGs with Safe-Area Clearance) */}
      <div
        className="fixed z-50 flex items-center gap-1.5 sm:gap-2"
        style={{
          top: 'max(0.75rem, env(safe-area-inset-top))',
          right: 'max(0.75rem, env(safe-area-inset-right))'
        }}
      >
        {/* 1. Expandir / Pantalla Completa */}
        <button
          type="button"
          onClick={toggleFullscreen}
          style={{ touchAction: 'manipulation' }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 shadow-md flex items-center justify-center transition-all active:scale-95 hover:border-white/40"
          title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        >
          {isFullscreen ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          )}
        </button>

        {/* 2. CRM Link */}
        <Link
          href="/crm"
          style={{ touchAction: 'manipulation' }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 text-blue-300 backdrop-blur-md border border-blue-400/30 shadow-md flex items-center justify-center transition-all active:scale-95 hover:border-blue-400/60"
          title="Ir al CRM"
          aria-label="Ir al CRM"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 9h18M9 21V9"/>
          </svg>
        </Link>

        {/* 3. Retroceder */}
        <button
          type="button"
          onClick={handleRetroceder}
          style={{ touchAction: 'manipulation' }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 shadow-md flex items-center justify-center transition-all active:scale-95 hover:border-white/40"
          title="Retroceder"
          aria-label="Retroceder"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>

      {currentStep === "welcome" && (
        <WelcomeSlide onStart={() => nextStep("discovery")} />
      )}
      {currentStep === "discovery" && (
        <DiscoverySlide 
          data={formData}
          onUpdate={updateFormData}
          onComplete={() => nextStep("form")} 
        />
      )}
      {currentStep === "form" && (
        <FormSlide 
          data={formData} 
          onUpdate={updateFormData} 
          onNext={() => nextStep("action")} 
        />
      )}
      {currentStep === "action" && (
        <ActionSlide 
          data={formData} 
          onUpdate={updateFormData} 
          onSuccess={() => nextStep("success")} 
        />
      )}
      {currentStep === "success" && (
        <SuccessSlide onReset={resetWizard} />
      )}

      {/* Botón flotante circular con logo Vitality que aparece tras 1 segundo para volver al Hub */}
      <FloatingHubHomeButton position="bottom-left" />
    </div>
  )
}
