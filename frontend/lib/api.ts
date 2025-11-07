import type {
    Patient,
    PatientCreate,
    PatientUpdate,
    SOAPNote,
    SOAPExtractAndSaveReq,
    SOAPNoteRecord,
    EncounterWithSOAP,
    AntibioticCheckRequest,
    AntibioticFindings,
    STTResponse,
    Encounter,
    EncounterCreate,
    EncounterUpdate,
    EncounterDetail,
  } from "./types"
  
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
  
  async function json<T>(res: Response): Promise<T> {
    if (!res.ok) {
      const contentType = res.headers.get("content-type") || ""
      let message = res.statusText || "Request failed"
      let parsed: any = null
      try {
        if (contentType.includes("application/json")) {
          parsed = await res.json()
          const detail = typeof parsed?.detail === "string" ? parsed.detail : undefined
          const msg = parsed?.message || parsed?.error || detail
          if (msg) message = msg
        } else {
          const text = await res.text()
          if (text) message = text.slice(0, 500)
        }
      } catch {
        // ignore parsing errors; fall back to status text
      }
      const err = new Error(`HTTP ${res.status} ${res.statusText}: ${message}`)
      ;(err as any).status = res.status
      ;(err as any).body = parsed
      throw err
    }
    return res.json()
  }
  
  export const api = {
    // Health check
    healthCheck: () => fetch(`${BASE_URL}/healthz`).then(json<{ status: string }>),
  
    // Patients
    createPatient: (body: PatientCreate) =>
      fetch(`${BASE_URL}/patients/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(json<Patient>),
  
    getPatient: (id: number) => fetch(`${BASE_URL}/patients/${id}`).then(json<Patient>),
  
    listPatients: (params?: { search?: string; skip?: number; limit?: number }) => {
      const q = new URLSearchParams()
      if (params?.search) q.set("search", params.search)
      q.set("skip", String(params?.skip ?? 0))
      q.set("limit", String(params?.limit ?? 100))
      return fetch(`${BASE_URL}/patients/?${q}`).then(json<Patient[]>)
    },
  
    updatePatient: (id: number, body: PatientUpdate) =>
      fetch(`${BASE_URL}/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(json<Patient>),
  
    // SOAP
    extractSOAP: (transcript: string) =>
      fetch(`${BASE_URL}/soap/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      }).then(json<SOAPNote>),
  
    extractAndSaveSOAP: (body: SOAPExtractAndSaveReq) =>
      fetch(`${BASE_URL}/soap/extract-and-save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(json<EncounterWithSOAP>),
  
    getSOAPByEncounter: (encounterId: number) =>
      fetch(`${BASE_URL}/soap/encounter/${encounterId}`).then(json<SOAPNoteRecord>),
  
    // Rules
    antibioticsCheck: (body: AntibioticCheckRequest) =>
      fetch(`${BASE_URL}/rules/antibiotics/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(json<AntibioticFindings>),
  
    antibioticsAnalyze: (body: AntibioticCheckRequest) =>
      fetch(`${BASE_URL}/rules/antibiotics/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((res) => json<any>(res)),
  
    // Transcripts STT
    uploadAudio: async (params: {
      patient_id: number
      encounter_type: string
      chief_complaint?: string
      language?: string
      file: File
    }) => {
      const form = new FormData()
      form.set("patient_id", String(params.patient_id))
      form.set("encounter_type", params.encounter_type)
      if (params.chief_complaint) form.set("chief_complaint", params.chief_complaint)
      form.set("language", params.language ?? "en")
      form.set("audio", params.file)
      const res = await fetch(`${BASE_URL}/transcripts/stt`, { method: "POST", body: form })
      return json<STTResponse>(res)
    },

    // Encounters
    listEncounters: (params?: { 
      skip?: number
      limit?: number
      patient_id?: number
      status?: string
      encounter_type?: string
    }) => {
      const q = new URLSearchParams()
      if (params?.skip !== undefined) q.set("skip", String(params.skip))
      if (params?.limit !== undefined) q.set("limit", String(params.limit))
      if (params?.patient_id !== undefined) q.set("patient_id", String(params.patient_id))
      if (params?.status) q.set("status", params.status)
      if (params?.encounter_type) q.set("encounter_type", params.encounter_type)
      return fetch(`${BASE_URL}/encounters/?${q}`).then(json<EncounterDetail[]>)
    },

    getEncounter: (id: number) => 
      fetch(`${BASE_URL}/encounters/${id}`).then(json<EncounterDetail>),

    createEncounter: (body: EncounterCreate) =>
      fetch(`${BASE_URL}/encounters/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(json<Encounter>),

    updateEncounter: (id: number, body: EncounterUpdate) =>
      fetch(`${BASE_URL}/encounters/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(json<Encounter>),

    deleteEncounter: (id: number) =>
      fetch(`${BASE_URL}/encounters/${id}`, {
        method: "DELETE",
      }).then(json<{ message: string }>),

    getPatientEncounters: (patientId: number, params?: { skip?: number; limit?: number }) => {
      const q = new URLSearchParams()
      if (params?.skip !== undefined) q.set("skip", String(params.skip))
      if (params?.limit !== undefined) q.set("limit", String(params.limit))
      return fetch(`${BASE_URL}/encounters/patient/${patientId}/encounters?${q}`).then(json<EncounterDetail[]>)
    },
  }
  