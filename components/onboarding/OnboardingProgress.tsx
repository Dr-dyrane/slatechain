"use client"

import { STEP_DETAILS } from "@/lib/constants/onboarding-steps"
import { CheckIcon } from "lucide-react"

interface OnboardingProgressProps {
    currentStep: number
    totalSteps: number
    completedSteps: number[]
}

export default function OnboardingProgress({ currentStep, totalSteps, completedSteps }: OnboardingProgressProps) {


    const isLastStepCompleted = completedSteps.includes(totalSteps - 1); // Check if the last step is completed
    const percentageComplete = Math.round(((completedSteps.length) / totalSteps) * 100); // Calculate percentage


    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-2">
                {/* ... (Step X of Y) */}
                <span className="text-sm font-medium text-gray-700">
                    Step {currentStep + 1} of {totalSteps}
                </span>
                <span className="text-sm font-medium text-gray-700">
                    {percentageComplete}% Complete
                </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                ></div>
            </div>

            <div className="mt-6 grid grid-cols-6 gap-2">
                {Object.entries(STEP_DETAILS).map(([stepIdStr, step], index) => {
                    const stepId = Number.parseInt(stepIdStr)
                    const isCompleted = completedSteps.includes(stepId)
                    const isCurrent = currentStep === stepId
                    const isLastStep = index === totalSteps - 1;


                    return (
                        <div key={stepId} className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 
                                    ${isCompleted || (isLastStep && isCurrent && isLastStepCompleted) // Combine completed and last step logic
                                        ? "bg-green-500 text-white" // Green if completed (including last step)
                                        : isCurrent
                                            ? "bg-blue-500 text-white" // Blue if current
                                            : "bg-gray-200 text-gray-500" // Gray otherwise
                                    }`
                                }
                            >
                                {/* Conditionally render content */}
                                {isCompleted || (isLastStep && isCurrent && isLastStepCompleted)
                                    ? <CheckIcon className="w-4 h-4" /> : <span>{index + 1}</span>}
                            </div>
                            <span className="text-xs text-center text-gray-500 hidden sm:block">{step.title}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

