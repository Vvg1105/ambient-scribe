"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import type { EncounterDetail } from "@/lib/types"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileText, Calendar, User, Filter, Search, Eye, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "deleted", label: "Deleted" },
]

export default function EncountersHistoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [encounters, setEncounters] = useState<EncounterDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const loadEncounters = async () => {
    try {
      setLoading(true)
      const params: any = { limit: 100 }
      if (statusFilter !== "all") {
        params.status = statusFilter
      }
      const data = await api.listEncounters(params)
      setEncounters(data)
    } catch (error) {
      console.error("Error loading encounters:", error)
      const message = error instanceof Error ? error.message : "Failed to load encounters"
      toast({
        title: "Error Loading Encounters",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEncounters()
  }, [statusFilter])

  const filteredEncounters = encounters.filter((encounter) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    const patientName = encounter.patient
      ? `${encounter.patient.first_name} ${encounter.patient.last_name}`.toLowerCase()
      : ""
    return (
      patientName.includes(search) ||
      encounter.encounter_type.toLowerCase().includes(search) ||
      encounter.chief_complaint?.toLowerCase().includes(search)
    )
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/encounters")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Encounter History</h1>
              <p className="text-muted-foreground">View and manage all patient encounters</p>
            </div>
          </div>
          <Button onClick={() => router.push("/encounters")} className="gap-2">
            <Plus className="h-4 w-4" />
            New Encounter
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient name, encounter type, or chief complaint..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Encounters Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredEncounters.length} Encounter{filteredEncounters.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredEncounters.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No encounters found</p>
                <p className="text-sm">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first encounter to get started"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Chief Complaint</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>SOAP</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEncounters.map((encounter) => (
                      <TableRow
                        key={encounter.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/encounters/${encounter.id}`)}
                      >
                        <TableCell className="font-medium">#{encounter.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {encounter.patient ? (
                              <span>
                                {encounter.patient.first_name} {encounter.patient.last_name}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Unknown Patient</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{encounter.encounter_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {encounter.chief_complaint || (
                              <span className="text-muted-foreground italic">None</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDate(encounter.encounter_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(encounter.status)} variant="secondary">
                            {encounter.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {encounter.soap_notes && encounter.soap_notes.length > 0 ? (
                            <Badge variant="default" className="bg-green-600">
                              ✓ Available
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/encounters/${encounter.id}`)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}