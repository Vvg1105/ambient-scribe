export type Patient = {
    id: number
    first_name: string
    last_name: string
    date_of_birth?: string | null
    medical_record_number?: string | null
    notes?: string | null
    created_at: string
    updated_at?: string | null
  }
  
  export type PatientCreate = Omit<Patient, "id" | "created_at" | "updated_at">
  export type PatientUpdate = Partial<Omit<Patient, "id" | "created_at" | "updated_at">>
  
  export type SOAPNote = {
    subjective: string
    objective: string
    assessment: string
    plan: string
  }
  
  export type SOAPExtractAndSaveReq = {
    patient_id: number
    encounter_type: string
    transcript: string
    chief_complaint?: string | null
    encounter_date?: string | null // ISO
  }
  
  export type SOAPNoteRecord = {
    id: number
    encounter_id: number
    soap_note: string
    subjective: string
    objective: string
    assessment: string
    plan: string
    model_used?: string | null
    processing_time_ms?: number | null
    confidence_score?: number | null
    created_at: string
  }
  
  export type EncounterWithSOAP = {
    id: number
    patient_id: number
    encounter_type: string
    chief_complaint?: string | null
    status: string
    encounter_date: string
    created_at: string
    transcript_content?: string | null
    soap_note?: SOAPNoteRecord | null
  }
  
  export type AntibioticCheckRequest = {
    meds: string[]
    allergies: string[]
    planText?: string | null
  }
  
  export type RuleFinding = {
    id: string
    title: string
    severity: "low" | "medium" | "high"
    details: string
  }
  
  export type AntibioticFindings = {
    findings: RuleFinding[]
  }
  
  export type STTResponse = {
    encounter_id: number
    patient_id: number
    transcript_preview: string
  }
  