"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronsUpDown, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import type { Patient } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface PatientSelectorProps {
  selectedPatient: Patient | null
  onPatientSelect: (patient: Patient | null) => void
}

export function PatientSelector({ selectedPatient, onPatientSelect }: PatientSelectorProps) {
  const [open, setOpen] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const loadPatients = async (search?: string) => {
    try {
      setLoading(true)
      const data = await api.listPatients({ search, limit: 50 })
      setPatients(data)
    } catch (error) {
      console.error("Error loading patients:", error)
      const message = error instanceof Error ? error.message : "Failed to load patients"
      toast({
        title: "Error Loading Patients",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadPatients()
    }
  }, [open])

  useEffect(() => {
    if (searchTerm && open) {
      const debounceTimer = setTimeout(() => {
        loadPatients(searchTerm)
      }, 300)
      return () => clearTimeout(debounceTimer)
    }
  }, [searchTerm, open])

  const formatPatientDisplay = (patient: Patient) => {
    const name = `${patient.first_name} ${patient.last_name}`
    const mrn = patient.medical_record_number ? ` (MRN: ${patient.medical_record_number})` : ""
    return `${name}${mrn}`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-transparent"
        >
          {selectedPatient ? (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="truncate">{formatPatientDisplay(selectedPatient)}</span>
            </div>
          ) : (
            "Select patient..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 z-[9999]" align="start">
        <Command>
          <CommandInput 
            placeholder="Search patients..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          />
          <CommandList>
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Loading patients...</div>
            ) : (
              <>
                <CommandEmpty>No patients found.</CommandEmpty>
                <CommandGroup>
                  {patients.map((patient) => (
                    <CommandItem
                      key={patient.id}
                      onSelect={() => {
                        onPatientSelect(patient.id === selectedPatient?.id ? null : patient)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn("mr-2 h-4 w-4", selectedPatient?.id === patient.id ? "opacity-100" : "opacity-0")}
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium">
                            {patient.first_name} {patient.last_name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              ID: {patient.id}
                            </Badge>
                            {patient.medical_record_number && (
                              <Badge variant="secondary" className="text-xs">
                                MRN: {patient.medical_record_number}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}