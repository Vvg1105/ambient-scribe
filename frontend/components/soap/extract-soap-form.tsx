"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FileText, Clock, Brain, CheckCircle } from "lucide-react"
import { api } from "@/lib/api"
import type { Patient, EncounterWithSOAP } from "@/lib/types"
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

export function ExtractSOAPForm() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [encounterType, setEncounterType] = useState("")
  const [chiefComplaint, setChiefComplaint] = useState("")
  const [transcript, setTranscript] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EncounterWithSOAP | null>(null)
  const { toast } = useToast()

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

    if (!transcript.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a transcript",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await api.extractAndSaveSOAP({
        patient_id: selectedPatient.id,
        encounter_type: encounterType,
        transcript: transcript.trim(),
        chief_complaint: chiefComplaint || null,
        encounter_date: new Date().toISOString(),
      })

      setResult(response)
      toast({
        title: "Success",
        description: "SOAP notes extracted and saved successfully",
      })

      // Reset form
      setSelectedPatient(null)
      setEncounterType("")
      setChiefComplaint("")
      setTranscript("")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to extract SOAP notes"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
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
            <Input
              id="chief-complaint"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="Brief description of the patient's main concern (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transcript">Transcript *</Label>
            <Textarea
              id="transcript"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Enter the clinical transcript text here..."
              rows={8}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground">{transcript.length} characters</div>
          </div>

          <Button type="submit" disabled={loading} className="w-full gap-2">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                Extracting SOAP...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Extract & Save SOAP
              </>
            )}
          </Button>
        </form>
      </div>

      <div>
        {result ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle className="text-green-600">SOAP Extraction Complete</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Encounter ID</Label>
                  <div className="mt-1">
                    <Badge variant="outline">{result.id}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Patient ID</Label>
                  <div className="mt-1">
                    <Badge variant="outline">{result.patient_id}</Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Encounter Type</Label>
                <div className="mt-1">
                  <Badge variant="secondary">{result.encounter_type}</Badge>
                </div>
              </div>

              {result.chief_complaint && (
                <div>
                  <Label className="text-sm font-medium">Chief Complaint</Label>
                  <p className="mt-1 text-sm text-foreground">{result.chief_complaint}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Encounter Date</Label>
                <p className="mt-1 text-sm text-muted-foreground">{formatDate(result.encounter_date)}</p>
              </div>

              {result.soap_note && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <Label className="font-medium">SOAP Notes</Label>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-blue-600">Subjective</Label>
                        <div className="mt-1 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{result.soap_note.subjective}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-green-600">Objective</Label>
                        <div className="mt-1 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{result.soap_note.objective}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-orange-600">Assessment</Label>
                        <div className="mt-1 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{result.soap_note.assessment}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-purple-600">Plan</Label>
                        <div className="mt-1 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                          <p className="text-sm whitespace-pre-wrap">{result.soap_note.plan}</p>
                        </div>
                      </div>
                    </div>

                    {result.soap_note.processing_time_ms && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Processed in {result.soap_note.processing_time_ms}ms</span>
                        {result.soap_note.model_used && <span>using {result.soap_note.model_used}</span>}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4" />
                <p>Fill out the form and submit to extract SOAP notes</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
