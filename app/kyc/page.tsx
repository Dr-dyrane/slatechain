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
import { submitKYCDataThunk, uploadDocumentThunk } from '@/lib/slices/kycSlice'
import { setKYCStatus } from '@/lib/slices/authSlice'
import { KYCStatus, UserRole } from '@/lib/types'

export default function KYCPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.auth)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)
    
    try {
      await dispatch(submitKYCDataThunk({
        userId: user!.id,
        fullName: formData.get('fullName') as string,
        dateOfBirth: formData.get('dateOfBirth') as string,
        address: formData.get('address') as string,
        role: user!.role,
        ...(user!.role === UserRole.SUPPLIER && {
          companyName: formData.get('companyName') as string,
          taxId: formData.get('taxId') as string,
        }),
      })).unwrap()

      const idDocument = formData.get('idDocument') as File
      if (idDocument) {
        await dispatch(uploadDocumentThunk({ documentType: 'ID_DOCUMENT', file: idDocument }))
      }

      if (user!.role === UserRole.SUPPLIER) {
        const taxDocument = formData.get('taxDocument') as File
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
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="idDocument">ID Document</Label>
                <Input id="idDocument" name="idDocument" type="file" required />
              </div>
              {user.role === UserRole.SUPPLIER && (
                <>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" name="companyName" required />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input id="taxId" name="taxId" required />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="taxDocument">Tax Document</Label>
                    <Input id="taxDocument" name="taxDocument" type="file" required />
                  </div>
                </>
              )}
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="mt-4 w-full">Submit KYC</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

