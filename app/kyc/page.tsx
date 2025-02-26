"use client"

import type React from "react"

import { useState } from "react"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type { RootState, AppDispatch } from "@/lib/store"
import { fetchKYCStatusThunk, startKYCProcessThunk, submitKYCDataThunk } from "@/lib/slices/kycSlice"
import { KYCStatus, UserRole, OnboardingStatus, KYCDocument, KYCState } from "@/lib/types"
import { AdminKYCForm } from "@/components/kyc/AdminKYCForm"
import { SupplierKYCForm } from "@/components/kyc/SupplierKYCForm"
import { ManagerKYCForm } from "@/components/kyc/ManagerKYCForm"
import { CustomerKYCForm } from "@/components/kyc/CustomerKYCForm"
import { KYCDocumentsSection } from "@/components/kyc/KYCDocumentsSection"
import LayoutLoader from "@/components/layout/loading"
import { ErrorState } from "@/components/ui/error"

export default function KYCPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.auth)
  const { status: kycStatus, documents, loading, error: kycError } = useSelector((state: RootState) => state.kyc)

  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    address: "",
    companyName: "",
    taxId: "",
    department: "",
    employeeId: "",
    teamSize: "",
    customerType: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Fetch KYC status and documents when component mounts
    dispatch(fetchKYCStatusThunk())
  }, [user, router, dispatch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleStartKYC = async () => {
    setError("")

    try {
      await dispatch(startKYCProcessThunk()).unwrap()
      dispatch(fetchKYCStatusThunk())
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to start KYC process")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    try {
      const kycData = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        role: user!.role,
        ...(user!.role === UserRole.SUPPLIER && {
          companyName: formData.companyName,
          taxId: formData.taxId,
        }),
        ...(user!.role === UserRole.ADMIN && {
          department: formData.department,
          employeeId: formData.employeeId,
        }),
        ...(user!.role === UserRole.MANAGER && {
          department: formData.department,
          teamSize: formData.teamSize,
        }),
        ...(user!.role === UserRole.CUSTOMER && {
          customerType: formData.customerType,
        }),
      }

      // Check if required documents are uploaded
      const hasIdDocument = documents.some((doc) => doc.type === "ID_DOCUMENT")
      const hasTaxDocument = user!.role !== UserRole.SUPPLIER || documents.some((doc) => doc.type === "TAX_DOCUMENT")

      if (!hasIdDocument || !hasTaxDocument) {
        setError("Please upload all required documents before submitting")
        return
      }

      await dispatch(submitKYCDataThunk(kycData as any)).unwrap()
      router.push("/onboarding")
    } catch (error) {
      setError(error instanceof Error ? error.message : "KYC submission failed. Please try again.")
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  const handleSkip = () => {
    if (user && user.onboardingStatus !== OnboardingStatus.COMPLETED) {
      router.push("/onboarding")
    } else {
      router.push("/dashboard")
    }
  }

  const renderKYCForm = () => {
    switch (user?.role) {
      case UserRole.ADMIN:
        return <AdminKYCForm formData={formData} onChange={handleInputChange} />
      case UserRole.SUPPLIER:
        return <SupplierKYCForm formData={formData} onChange={handleInputChange} />
      case UserRole.MANAGER:
        return <ManagerKYCForm formData={formData} onChange={handleInputChange} />
      case UserRole.CUSTOMER:
        return <CustomerKYCForm formData={formData} onChange={handleInputChange} />
      default:
        return null
    }
  }

  if (loading) {
    return <LayoutLoader />
  }

  if (kycError) {
    return (
      <div className="flex h-full items-center justify-center bg-none">
        <ErrorState
          title="KYC Error"
          description="We encountered an issue while loading your KYC data."
          message="There was an error loading your KYC, please try again later"
          onRetry={() => router.refresh()}
          onCancel={() => router.push("/dashboard")}
        />
      </div>
    )
  }

  if (kycStatus === KYCStatus.APPROVED) {
    return (
      <div className="flex h-full items-center justify-center bg-none">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-center">KYC Status</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Alert variant="default">
              <AlertDescription>Your KYC has been approved</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (kycStatus === KYCStatus.REJECTED) {
    return (
      <div className="flex h-full items-center justify-center bg-none">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-center">KYC Status</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Alert variant="destructive">
              <AlertDescription>Your KYC has been rejected</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (kycStatus === KYCStatus.PENDING_REVIEW) {
    return (
      <div className="flex h-full items-center justify-center bg-none">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-center">KYC Status</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Alert variant="default">
              <AlertDescription>Your KYC is pending review</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (kycStatus === KYCStatus.NOT_STARTED) {
    return (
      <div className="flex h-full items-center justify-center bg-none">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-center">KYC Verification</CardTitle>
            <CardDescription className="text-center">Start the KYC process to verify your identity</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">
              To access all features of our platform, you need to complete the KYC (Know Your Customer) verification
              process.
            </p>
            <Button onClick={handleStartKYC}>Start KYC Process</Button>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={handleSkip}>
              Skip for Now
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center bg-none">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row justify-between">
          <div>
            <CardTitle>KYC Verification</CardTitle>
            <CardDescription>Please provide the required information</CardDescription>
          </div>
          <Button type="button" variant="secondary" onClick={handleSkip}>
            Skip
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">{renderKYCForm()}</div>

            <KYCDocumentsSection documents={documents} />

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleGoBack}>
                Go Back
              </Button>
              <Button type="submit">Submit KYC</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

