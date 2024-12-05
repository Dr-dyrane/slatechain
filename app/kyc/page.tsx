"use client"

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RootState, AppDispatch } from '@/lib/store'
import { submitKYCDataThunk, uploadDocumentThunk } from '@/lib/slices/kycSlice'
import { setKYCStatus } from '@/lib/slices/authSlice'
import { KYCStatus, UserRole, OnboardingStatus } from '@/lib/types'
import { AdminKYCForm } from '@/components/kyc/AdminKYCForm'
import { SupplierKYCForm } from '@/components/kyc/SupplierKYCForm'
import { ManagerKYCForm } from '@/components/kyc/ManagerKYCForm'
import { CustomerKYCForm } from '@/components/kyc/CustomerKYCForm'

export default function KYCPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.auth)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    address: '',
    companyName: '',
    taxId: '',
    department: '',
    employeeId: '',
    teamSize: '',
    customerType: '',
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    try {
      const kycData = {
        userId: user!.id,
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

      await dispatch(submitKYCDataThunk(kycData)).unwrap()

      const idDocument = (e.currentTarget.elements.namedItem('idDocument') as HTMLInputElement).files?.[0]
      if (idDocument) {
        await dispatch(uploadDocumentThunk({ documentType: 'ID_DOCUMENT', file: idDocument }))
      }

      if (user!.role === UserRole.SUPPLIER) {
        const taxDocument = (e.currentTarget.elements.namedItem('taxDocument') as HTMLInputElement).files?.[0]
        if (taxDocument) {
          await dispatch(uploadDocumentThunk({ documentType: 'TAX_DOCUMENT', file: taxDocument }))
        }
      }

      dispatch(setKYCStatus(KYCStatus.PENDING_REVIEW))
      router.push('/onboarding')
    } catch (error) {
      setError('KYC submission failed. Please try again.')
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  const handleSkip = () => {
    if (user && user.onboardingStatus !== OnboardingStatus.COMPLETED) {
      router.push('/onboarding')
    } else {
      router.push('/dashboard')
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

  if (!user) return null

  return (
    <div className="flex h-full items-center justify-center bg-none">
      <Card className="w-full max-w-lg">
        <CardHeader className='flex flex-row justify-between'>
          <div>
            <CardTitle>KYC Verification</CardTitle>
            <CardDescription>Please provide the required information</CardDescription>
          </div>
          <Button type="button" variant="secondary" onClick={handleSkip}>
            Skip
          </Button> </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {renderKYCForm()}
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="idDocument" className="text-sm font-medium">
                  ID Document
                </label>
                <input
                  id="idDocument"
                  name="idDocument"
                  type="file"
                  required
                  className="mt-1 rounded-md bg-muted p-2"
                />
              </div>
              {user.role === UserRole.SUPPLIER && (
                <div className="flex flex-col space-y-1.5">
                  <label htmlFor="taxDocument" className="text-sm font-medium">
                    Tax Document
                  </label>
                  <input
                    id="taxDocument"
                    name="taxDocument"
                    type="file"
                    required
                    className="mt-1"
                  />
                </div>
              )}
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="mt-6 flex justify-between">
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

