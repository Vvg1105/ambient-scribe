"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FileText, Search, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { api } from "@/lib/api"
import type { SOAPNoteRecord } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export function GetSOAPForm() {
  const [encounterId, setEncounterId] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SOAPNoteRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const id = Number.parseInt(encounterId.trim())
    if (!id || isNaN(id)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid encounter ID",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await api.getSOAPByEncounter(id)
      setResult(response)
      toast({
        title: "Success",
        description: "SOAP notes retrieved successfully",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to retrieve SOAP notes"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
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
            <Label htmlFor="encounter-id">Encounter ID *</Label>
            <Input
              id="encounter-id"
              type="number"
              value={encounterId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEncounterId(e.target.value)}
              placeholder="Enter encounter ID (e.g., 123)"
              min="1"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full gap-2">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                Retrieving...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Get SOAP Notes
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
                <CardTitle className="text-green-600">SOAP Notes Found</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">SOAP Note ID</Label>
                  <div className="mt-1">
                    <Badge variant="outline">{result.id}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Encounter ID</Label>
                  <div className="mt-1">
                    <Badge variant="outline">{result.encounter_id}</Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Created</Label>
                <p className="mt-1 text-sm text-muted-foreground">{formatDate(result.created_at)}</p>
              </div>

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
                      <p className="text-sm whitespace-pre-wrap">{result.subjective}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-green-600">Objective</Label>
                    <div className="mt-1 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{result.objective}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-orange-600">Assessment</Label>
                    <div className="mt-1 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{result.assessment}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-purple-600">Plan</Label>
                    <div className="mt-1 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{result.plan}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {result.processing_time_ms && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{result.processing_time_ms}ms</span>
                    </div>
                  )}
                  {result.model_used && <span>Model: {result.model_used}</span>}
                  {result.confidence_score && <span>Confidence: {(result.confidence_score * 100).toFixed(1)}%</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 mb-4 text-destructive" />
                <p className="text-destructive font-medium">Error retrieving SOAP notes</p>
                <p className="text-sm text-muted-foreground mt-2">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center text-muted-foreground">
                <Search className="mx-auto h-12 w-12 mb-4" />
                <p>Enter an encounter ID to retrieve SOAP notes</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
