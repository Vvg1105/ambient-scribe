type AudioInfo = { codec: "opus" | "pcm16"; sampleRateHz: 16000 | 48000; channels: 1 }
type InitMessage = { type: "init"; sessionId: string; audio: AudioInfo }
type AudioMessage = { type: "audio"; seq: number; data: string }
type EndMessage = { type: "end" }
type ServerTranscriptChunk = {
  type: "transcript"
  id: string
  text: string
  partial: boolean
  startMs: number
  endMs: number
}
type ServerFinalSegment = { text: string; startMs: number; endMs: number }
type ServerFinal = { type: "final"; segments: ServerFinalSegment[] }
type ServerError = { type: "error"; message: string; code?: string }

export function createTranscribeSocket(base = "ws://localhost:8000/ws/transcribe") {
  const ws = new WebSocket(base)

  ws.addEventListener("open", () => {
    const init: InitMessage = {
      type: "init",
      sessionId: crypto.randomUUID(),
      audio: { codec: "opus", sampleRateHz: 16000, channels: 1 },
    }
    ws.send(JSON.stringify(init))
  })

  function sendAudio(seq: number, dataBase64: string) {
    const msg: AudioMessage = { type: "audio", seq, data: dataBase64 }
    ws.send(JSON.stringify(msg))
  }

  function end() {
    const msg: EndMessage = { type: "end" }
    ws.send(JSON.stringify(msg))
  }

  function onMessage(handler: (msg: ServerTranscriptChunk | ServerFinal | ServerError) => void) {
    ws.addEventListener("message", (ev) => {
      const parsed = JSON.parse(ev.data)
      handler(parsed)
    })
  }

  return { ws, sendAudio, end, onMessage }
}

export type { ServerTranscriptChunk, ServerFinal, ServerError, ServerFinalSegment }
