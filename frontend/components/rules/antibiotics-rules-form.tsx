"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, Plus, Shield, Search, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { api } from "@/lib/api"
import type { AntibioticFindings } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export function AntibioticsRulesForm() {
  const [medications, setMedications] = useState<string[]>([])
  const [allergies, setAllergies] = useState<string[]>([])
  const [planText, setPlanText] = useState("")
  const [newMed, setNewMed] = useState("")
  const [newAllergy, setNewAllergy] = useState("")
  const [checkLoading, setCheckLoading] = useState(false)
  const [analyzeLoading, setAnalyzeLoading] = useState(false)
  const [checkResult, setCheckResult] = useState<AntibioticFindings | null>(null)
  const [analyzeResult, setAnalyzeResult] = useState<any>(null)
  const { toast } = useToast()

  const addMedication = () => {
    if (newMed.trim() && !medications.includes(newMed.trim())) {
      setMedications([...medications, newMed.trim()])
      setNewMed("")
    }
  }

  const removeMedication = (med: string) => {
    setMedications(medications.filter((m) => m !== med))
  }

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()])
      setNewAllergy("")
    }
  }

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter((a) => a !== allergy))
  }

  const handleCheck = async () => {
    if (medications.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one medication",
        variant: "destructive",
      })
      return
    }

    setCheckLoading(true)
    setCheckResult(null)

    try {
      const response = await api.antibioticsCheck({
        meds: medications,
        allergies,
        planText: planText || null,
      })

      setCheckResult(response)
      toast({
        title: "Success",
        description: "Antibiotics check completed",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to perform antibiotics check"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setCheckLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (medications.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one medication",
        variant: "destructive",
      })
      return
    }

    setAnalyzeLoading(true)
    setAnalyzeResult(null)

    try {
      const response = await api.antibioticsAnalyze({
        meds: medications,
        allergies,
        planText: planText || null,
      })

      setAnalyzeResult(response)
      toast({
        title: "Success",
        description: "Antibiotics analysis completed",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to perform antibiotics analysis"
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setAnalyzeLoading(false)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "medium":
        return <Info className="h-4 w-4 text-yellow-500" />
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Medications</Label>
            <div className="flex gap-2">
              <Input
                value={newMed}
                onChange={(e) => setNewMed(e.target.value)}
                placeholder="Enter medication name"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMedication())}
              />
              <Button
                type="button"
                onClick={addMedication}
                variant="outline"
                size="sm"
                className="gap-1 bg-transparent"
              >
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {medications.map((med) => (
                <Badge key={med} variant="secondary" className="gap-1">
                  {med}
                  <button
                    type="button"
                    onClick={() => removeMedication(med)}
                    className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Allergies</Label>
            <div className="flex gap-2">
              <Input
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="Enter allergy"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAllergy())}
              />
              <Button type="button" onClick={addAllergy} variant="outline" size="sm" className="gap-1 bg-transparent">
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy) => (
                <Badge key={allergy} variant="destructive" className="gap-1">
                  {allergy}
                  <button
                    type="button"
                    onClick={() => removeAllergy(allergy)}
                    className="ml-1 hover:bg-destructive-foreground hover:text-destructive rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan-text">Plan Text (Optional)</Label>
            <Textarea
              id="plan-text"
              value={planText}
              onChange={(e) => setPlanText(e.target.value)}
              placeholder="Enter additional plan text for context..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCheck} disabled={checkLoading} className="flex-1 gap-2">
              {checkLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  Checking...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Check
                </>
              )}
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={analyzeLoading}
              variant="outline"
              className="flex-1 gap-2 bg-transparent"
            >
              {analyzeLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {checkResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Safety Check Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {checkResult.findings.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <p className="text-green-600 font-medium">No safety concerns found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    All medications appear safe with the given allergies
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {checkResult.findings.map((finding) => (
                    <div key={finding.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(finding.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{finding.title}</h4>
                            <Badge className={cn("text-xs", getSeverityColor(finding.severity))}>
                              {finding.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{finding.details}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {analyzeResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96">
                  {JSON.stringify(analyzeResult, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {!checkResult && !analyzeResult && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center text-muted-foreground">
                <Shield className="mx-auto h-12 w-12 mb-4" />
                <p>Add medications and run a check or analysis</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
