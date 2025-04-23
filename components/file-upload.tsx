"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Camera, File, FileText, Plus, Upload, X } from "lucide-react"

interface FileUploadProps {
  onUploadComplete?: (files: File[], images: string[]) => void
  trigger?: React.ReactNode
  title?: string
  description?: string
}

export function FileUpload({
  onUploadComplete,
  trigger,
  title = "Upload Files",
  description = "Upload files or take photos",
}: FileUploadProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("file")
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      setSelectedFiles(filesArray)
    }
  }

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const imageUrl = URL.createObjectURL(file)
      setCapturedImages([...capturedImages, imageUrl])
    }
  }

  const removeImage = (index: number) => {
    setCapturedImages(capturedImages.filter((_, i) => i !== index))
  }

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    if (
      (activeTab === "file" && selectedFiles.length === 0) ||
      (activeTab === "camera" && capturedImages.length === 0)
    ) {
      toast({
        title: "No files selected",
        description: "Please select files or capture images to upload",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setOpen(false)

          toast({
            title: "Upload complete",
            description: "Your files have been uploaded successfully",
          })

          if (onUploadComplete) {
            onUploadComplete(selectedFiles, capturedImages)
          }

          // Reset the form
          setSelectedFiles([])
          setCapturedImages([])

          return 0
        }
        return prev + 10
      })
    }, 300)
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const triggerCameraInput = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click()
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    switch (extension) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />
      case "doc":
      case "docx":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "ppt":
      case "pptx":
        return <FileText className="h-5 w-5 text-orange-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>Upload Files</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">Upload Files</TabsTrigger>
            <TabsTrigger value="camera">Take Photos</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4 py-4">
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={triggerFileInput}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx"
              />
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">PDF, DOCX, PPT (Max 10MB)</p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Selected Files</h4>
                <ScrollArea className="h-[150px]">
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.name)}
                          <span className="text-sm truncate max-w-[300px]">{file.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>

          <TabsContent value="camera" className="space-y-4 py-4">
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={triggerCameraInput}
            >
              <input
                type="file"
                ref={cameraInputRef}
                onChange={handleCameraCapture}
                className="hidden"
                accept="image/*"
                capture="environment"
              />
              <Camera className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium">Click to take a photo</p>
              <p className="text-xs text-gray-500 mt-1">Take multiple photos for multi-page assignments</p>
            </div>

            {capturedImages.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Captured Images</h4>
                <div className="grid grid-cols-2 gap-2">
                  {capturedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Captured ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div
                    className="flex items-center justify-center h-32 border-2 border-dashed rounded cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={triggerCameraInput}
                  >
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
