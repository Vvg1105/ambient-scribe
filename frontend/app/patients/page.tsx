"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit } from "lucide-react"
import { api } from "@/lib/api"
import type { Patient } from "@/lib/types"
import { PatientModal } from "@/components/patients/patient-modal"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const { toast } = useToast()

  const loadPatients = async (search?: string) => {
    try {
      setLoading(true)
      const data = await api.listPatients({ search, limit: 100 })
      setPatients(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
  }, [])

  const handleSearch = () => {
    loadPatients(searchTerm)
  }

  const handleCreatePatient = () => {
    setEditingPatient(null)
    setModalOpen(true)
  }

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient)
    setModalOpen(true)
  }

  const handlePatientSaved = () => {
    setModalOpen(false)
    setEditingPatient(null)
    loadPatients(searchTerm)
    toast({
      title: "Success",
      description: editingPatient ? "Patient updated successfully" : "Patient created successfully",
    })
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch {
      return "Invalid date"
    }
  }

  const formatDOB = (dobString?: string | null) => {
    if (!dobString) return "Not provided"
    try {
      return format(new Date(dobString), "MMM dd, yyyy")
    } catch {
      return "Invalid date"
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Patients</h1>
            <p className="text-muted-foreground">Manage patient records and information</p>
          </div>
          <Button onClick={handleCreatePatient} className="gap-2">
            <Plus className="h-4 w-4" />
            New Patient
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Patient Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Search by first name, last name, or MRN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="outline" className="gap-2 bg-transparent">
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient List ({patients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading patients...</div>
              </div>
            ) : patients.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-muted-foreground">No patients found</p>
                  <Button onClick={handleCreatePatient} className="mt-2 gap-2">
                    <Plus className="h-4 w-4" />
                    Create First Patient
                  </Button>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>MRN</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <Badge variant="outline">{patient.id}</Badge>
                      </TableCell>
                      <TableCell>
                        {patient.medical_record_number ? (
                          <Badge variant="secondary">{patient.medical_record_number}</Badge>
                        ) : (
                          <span className="text-muted-foreground">Not set</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {patient.first_name} {patient.last_name}
                      </TableCell>
                      <TableCell>{formatDOB(patient.date_of_birth)}</TableCell>
                      <TableCell>{formatDate(patient.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPatient(patient)}
                            className="gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <PatientModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          patient={editingPatient}
          onSaved={handlePatientSaved}
        />
      </div>
    </MainLayout>
  )
}
