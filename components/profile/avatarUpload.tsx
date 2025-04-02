"use client"

import type React from "react"
import { useState, useRef } from "react"
import type { User } from "@/lib/types"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import { uploadAvatar } from "@/lib/slices/avatarSlice"
import { updateUser } from "@/lib/slices/authSlice"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, RefreshCw, Camera } from "lucide-react"

interface AvatarUploadProps {
  user: User
  refetch: () => void
}

export default function AvatarUpload({ user, refetch }: AvatarUploadProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { isUploading, error } = useSelector((state: RootState) => state.avatar)
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatarUrl || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getInitials = () => {
    if (!user) return "U"
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}` || "U"
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, WEBP)")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB")
      return
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setSelectedFile(file) // Save the selected file for later upload
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      // Upload the file using the Redux thunk
      const resultAction = await dispatch(uploadAvatar(selectedFile))

      if (uploadAvatar.fulfilled.match(resultAction)) {
        // Get the avatar URL from the response
        const { avatarUrl } = resultAction.payload

        // Update user profile with the new avatar URL
        await dispatch(updateUser({ avatarUrl })).unwrap()

        toast.success("Avatar updated successfully")
        setSelectedFile(null) // Clear the selected file after successful upload
        refetch()
      } else if (uploadAvatar.rejected.match(resultAction) && resultAction.payload) {
        toast.error(resultAction.payload)
        // Reset preview to the original avatar if upload fails
        setPreviewUrl(user?.avatarUrl || null)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update avatar")
      // Reset preview to the original avatar if upload fails
      setPreviewUrl(user?.avatarUrl || null)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className="w-full my-6">
      <CardHeader>
        <CardTitle>Profile Avatar</CardTitle>
        <CardDescription>Upload a profile picture</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="h-24 w-24">
            {/* Display the preview URL or the default avatar */}
            <AvatarImage src={previewUrl || undefined} alt={user?.firstName || "User"} />
            <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-0 right-0 rounded-full bg-background shadow-md"
            onClick={triggerFileInput}
            disabled={isUploading}
          >
            <Camera className="h-4 w-4" />
            <span className="sr-only">Upload avatar</span>
          </Button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
        />
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="outline" onClick={handleUpload} disabled={isUploading || !selectedFile} className="w-full">
          {isUploading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {selectedFile ? "Upload Selected Image" : "Upload New Avatar"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

