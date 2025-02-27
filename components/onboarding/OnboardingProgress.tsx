"use client"

import { STEP_DETAILS, MAX_STEPS } from "@/lib/constants/onboarding-steps"
import { CheckIcon } from "lucide-react"

interface OnboardingProgressProps {
    currentStep: number
    totalSteps: number
    completedSteps: number[]
}

export default function OnboardingProgress({ currentStep, totalSteps, completedSteps }: OnboardingProgressProps) {
    // Ensure we're using the correct total steps value
    const maxSteps = MAX_STEPS

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                    Step {currentStep + 1} of {maxSteps}
                </span>
                <span className="text-sm font-medium text-gray-700">
                    {Math.round(((completedSteps.length + (currentStep === maxSteps - 1 ? 1 : 0)) / maxSteps) * 100)}% Complete
                </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${((currentStep + 1) / maxSteps) * 100}%` }}
                ></div>
            </div>

            <div className="mt-6 grid grid-cols-6 gap-2">
                {Object.entries(STEP_DETAILS).map(([stepIdStr, step], index) => {
                    const stepId = Number.parseInt(stepIdStr)
                    const isCompleted = completedSteps.includes(stepId)
                    const isCurrent = currentStep === stepId

                    return (
                        <div key={stepId} className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${isCompleted
                                        ? "bg-green-500 text-white"
                                        : isCurrent
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-200 text-gray-500"
                                    }`}
                            >
                                {isCompleted ? <CheckIcon className="w-4 h-4" /> : <span>{index + 1}</span>}
                            </div>
                            <span className="text-xs text-center text-gray-500 hidden sm:block">{step.title}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

