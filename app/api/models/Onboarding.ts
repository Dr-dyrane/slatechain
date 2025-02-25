// app/api/models/Onboarding.ts

import mongoose from "mongoose"
import { OnboardingStatus, OnboardingStepStatus } from "@/lib/types"

const OnboardingStepSchema = new mongoose.Schema({
  stepId: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(OnboardingStepStatus),
    default: OnboardingStepStatus.NOT_STARTED,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  completedAt: {
    type: Date,
  },
  skippedAt: {
    type: Date,
  },
  skipReason: {
    type: String,
  },
})

const OnboardingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: Object.values(OnboardingStatus),
      default: OnboardingStatus.NOT_STARTED,
    },
    currentStep: {
      type: Number,
      default: 0,
    },
    steps: [OnboardingStepSchema],
    completedAt: {
      type: Date,
    },
    roleSpecificData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
)

// Add methods to the schema
OnboardingSchema.methods.toJSON = function () {
  const obj = this.toObject()
  return {
    ...obj,
    steps: obj.steps.map((step: any) => ({
      id: step.stepId,
      status: step.status,
      data: step.data,
      completedAt: step.completedAt,
      skippedAt: step.skippedAt,
      skipReason: step.skipReason,
    })),
  }
}

export default mongoose.models.Onboarding || mongoose.model("Onboarding", OnboardingSchema)

