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
  } from "./types"
  
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
  
  async function json<T>(res: Response): Promise<T> {
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`HTTP ${res.status}: ${body}`)
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
  }
  