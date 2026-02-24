"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { WelcomeSlide } from "./slides/WelcomeSlide"
import { DiscoverySlide } from "./slides/DiscoverySlide"
import { FormSlide } from "./slides/FormSlide"
import { ActionSlide } from "./slides/ActionSlide"
import { SuccessSlide } from "./slides/SuccessSlide"
import { LeadData } from "@/app/actions/leads"
import { useAuth, initiateAnonymousSignIn } from "@/firebase"

type Step = "welcome" | "discovery" | "form" | "action" | "success"

export function LeadWizard() {
  const auth = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>("welcome")
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

  // Ensure user is signed in anonymously to satisfy Firestore security rules
  useEffect(() => {
    if (auth && !auth.currentUser) {
      initiateAnonymousSignIn(auth)
    }
  }, [auth])

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
    <div className="flex flex-col h-svh w-full bg-background overflow-hidden">
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
    </div>
  )
}
