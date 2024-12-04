import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ServiceQuestionsProps } from '@/lib/types/onboarding'

export function ServiceQuestions({ role, onComplete }: ServiceQuestionsProps) {
  const [formData, setFormData] = useState({
    productTypes: '',
    paymentMethod: '',
    teamOversight: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service-Specific Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {role === 'supplier' && (
              <>
                <div>
                  <Label htmlFor="productTypes">What types of products do you supply?</Label>
                  <Input
                    id="productTypes"
                    name="productTypes"
                    value={formData.productTypes}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod">What is your preferred payment method?</Label>
                  <Input
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            )}
            {role === 'manager' && (
              <div>
                <Label htmlFor="teamOversight">Which teams will you oversee?</Label>
                <Input
                  id="teamOversight"
                  name="teamOversight"
                  value={formData.teamOversight}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

