"use client"

import { type ChangeEvent, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, FileAudio, CheckCircle, AlertCircle } from "lucide-react"
import { api } from "@/lib/api"
import type { Patient, STTResponse } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { PatientSelector } from "@/components/encounters/patient-selector"

const ENCOUNTER_TYPES = [
  "Initial Consultation",
  "Follow-up Visit",
  "Emergency Visit",
  "Routine Checkup",
  "Specialist Consultation",
  "Procedure",
  "Discharge",
  "Other",
]

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
]

export default function EncountersPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [encounterType, setEncounterType] = useState("")
  const [chiefComplaint, setChiefComplaint] = useState("")
  const [language, setLanguage] = useState("en")
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<STTResponse | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ["audio/wav", "audio/mpeg", "audio/mp3"]
      if (!validTypes.includes(file.type) && !file.name.match(/\.(wav|mp3)$/i)) {
        toast({
          title: "Invalid File Type",
          description: "Please select a .wav or .mp3 audio file",
          variant: "destructive",
        })
        return
      }
      setAudioFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPatient) {
      toast({
        title: "Validation Error",
        description: "Please select a patient",
        variant: "destructive",
      })
      return
    }

    if (!encounterType) {
      toast({
        title: "Validation Error",
        description: "Please select an encounter type",
        variant: "destructive",
      })
      return
    }

    if (!audioFile) {
      toast({
        title: "Validation Error",
        description: "Please select an audio file",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await api.uploadAudio({
        patient_id: selectedPatient.id,
        encounter_type: encounterType,
        chief_complaint: chiefComplaint || undefined,
        language,
        file: audioFile,
      })

      setResult(response)
      toast({
        title: "Success",
        description: "Audio uploaded and transcribed successfully",
      })

      // Reset form
      setSelectedPatient(null)
      setEncounterType("")
      setChiefComplaint("")
      setLanguage("en")
      setAudioFile(null)

      // Reset file input
      const fileInput = document.getElementById("audio-file") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload and transcribe audio",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">New Encounter</h1>
          <p className="text-muted-foreground">Upload audio files for transcription and encounter creation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Encounter Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Patient *</Label>
                  <PatientSelector selectedPatient={selectedPatient} onPatientSelect={setSelectedPatient} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="encounter-type">Encounter Type *</Label>
                  <Select value={encounterType} onValueChange={setEncounterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select encounter type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENCOUNTER_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chief-complaint">Chief Complaint</Label>
                  <Textarea
                    id="chief-complaint"
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    placeholder="Brief description of the patient's main concern (optional)"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audio-file">Audio File *</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6">
                    <div className="text-center">
                      <FileAudio className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-4">
                        <Label htmlFor="audio-file" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-foreground">Choose audio file</span>
                          <span className="mt-1 block text-xs text-muted-foreground">Supports .wav and .mp3 files</span>
                        </Label>
                        <Input
                          id="audio-file"
                          type="file"
                          accept=".wav,.mp3,audio/wav,audio/mpeg"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {audioFile && (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <FileAudio className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{audioFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(audioFile.size)}</p>
                      </div>
                      <Badge variant="outline">Ready</Badge>
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={loading} className="w-full gap-2">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload & Transcribe
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transcription Result</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Transcription Complete</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Encounter ID</Label>
                      <div className="mt-1">
                        <Badge variant="outline">{result.encounter_id}</Badge>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Patient ID</Label>
                      <div className="mt-1">
                        <Badge variant="outline">{result.patient_id}</Badge>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Transcript Preview</Label>
                      <div className="mt-1 p-3 bg-muted rounded-lg">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{result.transcript_preview}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <div className="text-center">
                    <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                    <p>Upload an audio file to see transcription results</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
