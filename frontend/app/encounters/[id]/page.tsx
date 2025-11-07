"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  FileText, 
  Clock, 
  Activity,
  AlertCircle
} from "lucide-react"
import { api } from "@/lib/api"
import type { EncounterDetail } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function EncounterDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [encounter, setEncounter] = useState<EncounterDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const encounterId = typeof params.id === "string" ? Number.parseInt(params.id, 10) : null

  useEffect(() => {
    if (!encounterId) {
      toast({
        title: "Invalid Encounter ID",
        description: "The encounter ID is invalid",
        variant: "destructive",
      })
      router.push("/encounters/history")
      return
    }

    const loadEncounter = async () => {
      try {
        setLoading(true)
        const data = await api.getEncounter(encounterId)
        setEncounter(data)
      } catch (error) {
        console.error("Error loading encounter:", error)
        const message = error instanceof Error ? error.message : "Failed to load encounter"
        toast({
          title: "Error Loading Encounter",
          description: message,
          variant: "destructive",
        })
        router.push("/encounters/history")
      } finally {
        setLoading(false)
      }
    }

    loadEncounter()
  }, [encounterId])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "deleted":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading encounter...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!encounter) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Encounter not found</p>
            <Button onClick={() => router.push("/encounters/history")}>Back to History</Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  const transcript = encounter.transcripts?.[0]
  const soapNote = encounter.soap_notes?.[0]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/encounters/history")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Encounter #{encounter.id}</h1>
              <p className="text-muted-foreground">{encounter.encounter_type}</p>
            </div>
          </div>
          <Badge className={getStatusColor(encounter.status)} variant="secondary">
            {encounter.status}
          </Badge>
        </div>

        {/* Patient & Encounter Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {encounter.patient ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {encounter.patient.first_name} {encounter.patient.last_name}
                    </p>
                  </div>
                  {encounter.patient.medical_record_number && (
                    <div>
                      <p className="text-sm text-muted-foreground">Medical Record Number</p>
                      <p className="font-medium">{encounter.patient.medical_record_number}</p>
                    </div>
                  )}
                  {encounter.patient.date_of_birth && (
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">{formatDate(encounter.patient.date_of_birth)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Patient ID</p>
                    <p className="font-medium">#{encounter.patient.id}</p>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground italic">Patient information not available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Encounter Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium">{formatDate(encounter.encounter_date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <Badge variant="outline">{encounter.encounter_type}</Badge>
              </div>
              {encounter.chief_complaint && (
                <div>
                  <p className="text-sm text-muted-foreground">Chief Complaint</p>
                  <p className="font-medium">{encounter.chief_complaint}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm">{formatDate(encounter.created_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transcript & SOAP Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Clinical Documentation
            </CardTitle>
            <CardDescription>Transcript and extracted SOAP notes</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="soap" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="soap">SOAP Note</TabsTrigger>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
              </TabsList>

              <TabsContent value="soap" className="space-y-6 mt-6">
                {soapNote ? (
                  <>
                    {/* SOAP Metadata */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pb-4 border-b">
                      {soapNote.model_used && (
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          <span>Model: {soapNote.model_used}</span>
                        </div>
                      )}
                      {soapNote.processing_time_ms && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Processed in {soapNote.processing_time_ms}ms</span>
                        </div>
                      )}
                      {soapNote.confidence_score && (
                        <div className="flex items-center gap-2">
                          <span>Confidence: {(soapNote.confidence_score * 100).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>

                    {/* Subjective */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">
                        Subjective
                      </h3>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap">{soapNote.subjective}</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Objective */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-green-600 dark:text-green-400">
                        Objective
                      </h3>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap">{soapNote.objective}</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Assessment */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-orange-600 dark:text-orange-400">
                        Assessment
                      </h3>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap">{soapNote.assessment}</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Plan */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-purple-600 dark:text-purple-400">
                        Plan
                      </h3>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap">{soapNote.plan}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No SOAP Note Available</p>
                    <p className="text-sm">SOAP note has not been extracted for this encounter</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="transcript" className="space-y-4 mt-6">
                {transcript ? (
                  <>
                    <div className="flex items-center justify-between pb-4 border-b">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {transcript.language && (
                          <Badge variant="secondary">Language: {transcript.language}</Badge>
                        )}
                        <span>Created: {formatDate(transcript.created_at)}</span>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-6">
                      <p className="whitespace-pre-wrap leading-relaxed">{transcript.content}</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No Transcript Available</p>
                    <p className="text-sm">Transcript has not been generated for this encounter</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

