"use client"

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RootState, AppDispatch } from '@/lib/store'
import { submitKYCData, uploadDocument } from '@/lib/slices/kycSlice'
import { setKYCStatus } from '@/lib/slices/authSlice'
import { KYCStatus, UserRole } from '@/types/auth'

export default function KYCPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { user, kycStatus } = useSelector((state: RootState) => state.auth)
  const [error, setError] = useState('')

  useEffect(() => {
    if (kycStatus === KYCStatus.APPROVED) {
      router.push('/onboarding')
    }
  }, [kycStatus, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)
    
    try {
      await dispatch(submitKYCData({
        userId: user!.id,
        fullName: formData.get('fullName') as string,
        dateOfBirth: formData.get('dateOfBirth') as string,
        address: formData.get('address') as string,
        role: user!.role,
        // Add role-specific fields here
        ...(user!.role === UserRole.SUPPLIER && {
          companyName: formData.get('companyName') as string,
          taxId: formData.get('taxId') as string,
        }),
        ...(user!.role === UserRole.CUSTOMER && {
          customerType: formData.get('customerType') as string,
        }),
      })).unwrap()

      const idDocument = formData.get('idDocument') as File
      const addressProof = formData.get('addressProof') as File

      if (idDocument) {
        await dispatch(uploadDocument({ userId: user!.id, documentType: 'ID_DOCUMENT', file: idDocument }))
      }
      if (addressProof) {
        await dispatch(uploadDocument({ userId: user!.id, documentType: 'ADDRESS_PROOF', file: addressProof }))
      }

      // Upload role-specific documents
      if (user!.role === UserRole.SUPPLIER) {
        const businessLicense = formData.get('businessLicense') as File
        if (businessLicense) {
          await dispatch(uploadDocument({ userId: user!.id, documentType: 'BUSINESS_LICENSE', file: businessLicense }))
        }
      }

      dispatch(setKYCStatus(KYCStatus.IN_PROGRESS))
      router.push('/onboarding')
    } catch (error) {
      setError('KYC submission failed. Please try again.')
    }
  }

  const handleContinueLater = () => {
    dispatch(setKYCStatus(KYCStatus.IN_PROGRESS))
    router.push('/dashboard')
  }

  if (!user) return null

  return (
    <div className="flex h-full items-center justify-center bg-none">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>Please provide the required information for KYC verification</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* ... (keep existing form fields) */}
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={handleContinueLater}>
                Continue Later
              </Button>
              <Button type="submit">Submit KYC</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

