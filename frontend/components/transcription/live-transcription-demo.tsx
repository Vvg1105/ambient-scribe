"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mic, MicOff, Square, Wifi, WifiOff, Volume2, Clock, MessageSquare } from "lucide-react"
import { createTranscribeSocket } from "@/lib/websocket"
import type { ServerTranscriptChunk, ServerFinal, ServerError } from "@/lib/websocket"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface TranscriptChunk {
  id: string
  text: string
  partial: boolean
  startMs: number
  endMs: number
  timestamp: Date
}

interface FinalSegment {
  text: string
  startMs: number
  endMs: number
  timestamp: Date
}

const DEMO_AUDIO_CHUNKS = [
  "Hello, this is a test of the transcription system.",
  "The patient presents with chest pain and shortness of breath.",
  "Vital signs are stable with blood pressure 120 over 80.",
  "Heart rate is 72 beats per minute and regular.",
  "Lungs are clear to auscultation bilaterally.",
  "Recommend EKG and chest X-ray for further evaluation.",
]

export function LiveTranscriptionDemo() {
  const [connected, setConnected] = useState(false)
  const [recording, setRecording] = useState(false)
  const [transcriptChunks, setTranscriptChunks] = useState<TranscriptChunk[]>([])
  const [finalSegments, setFinalSegments] = useState<FinalSegment[]>([])
  const [error, setError] = useState<string | null>(null)
  const [audioSequence, setAudioSequence] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const socketRef = useRef<ReturnType<typeof createTranscribeSocket> | null>(null)
  const { toast } = useToast()

  const connect = () => {
    try {
      setError(null)
      const socket = createTranscribeSocket()
      socketRef.current = socket

      socket.ws.addEventListener("open", () => {
        setConnected(true)
        setSessionId(crypto.randomUUID())
        toast({
          title: "Connected",
          description: "WebSocket connection established",
        })
      })

      socket.ws.addEventListener("close", () => {
        setConnected(false)
        setRecording(false)
        setSessionId(null)
        toast({
          title: "Disconnected",
          description: "WebSocket connection closed",
        })
      })

      socket.ws.addEventListener("error", () => {
        setError("WebSocket connection failed")
        toast({
          title: "Connection Error",
          description: "Failed to connect to transcription service",
          variant: "destructive",
        })
      })

      socket.onMessage((message) => {
        if (message.type === "transcript") {
          const chunk = message as ServerTranscriptChunk
          setTranscriptChunks((prev) => {
            const existing = prev.find((c) => c.id === chunk.id)
            if (existing) {
              return prev.map((c) => (c.id === chunk.id ? { ...chunk, timestamp: c.timestamp } : c))
            }
            return [...prev, { ...chunk, timestamp: new Date() }]
          })
        } else if (message.type === "final") {
          const final = message as ServerFinal
          const finalSegments = final.segments.map((segment) => ({
            ...segment,
            timestamp: new Date(),
          }))
          setFinalSegments((prev) => [...prev, ...finalSegments])
          // Clear partial chunks when we get final segments
          setTranscriptChunks([])
        } else if (message.type === "error") {
          const errorMsg = message as ServerError
          setError(errorMsg.message)
          toast({
            title: "Transcription Error",
            description: errorMsg.message,
            variant: "destructive",
          })
        }
      })
    } catch (err) {
      setError("Failed to create WebSocket connection")
      toast({
        title: "Error",
        description: "Failed to create WebSocket connection",
        variant: "destructive",
      })
    }
  }

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.ws.close()
      socketRef.current = null
    }
    setConnected(false)
    setRecording(false)
    setSessionId(null)
  }

  const startRecording = () => {
    if (!connected || !socketRef.current) return
    setRecording(true)
    setAudioSequence(0)
    setTranscriptChunks([])
    setFinalSegments([])
    setError(null)
  }

  const stopRecording = () => {
    if (!connected || !socketRef.current) return
    socketRef.current.end()
    setRecording(false)
  }

  const sendDemoAudio = (chunkText: string) => {
    if (!connected || !socketRef.current || !recording) return

    // Simulate sending audio data (in a real app, this would be actual audio data)
    const demoData = btoa(chunkText) // Base64 encode the text as demo data
    socketRef.current.sendAudio(audioSequence, demoData)
    setAudioSequence((prev) => prev + 1)
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString()
  }

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.ws.close()
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {connected ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
            <Badge variant={connected ? "default" : "secondary"}>{connected ? "Connected" : "Disconnected"}</Badge>
          </div>
          {sessionId && (
            <Badge variant="outline" className="font-mono text-xs">
              Session: {sessionId.slice(0, 8)}...
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          {!connected ? (
            <Button onClick={connect} className="gap-2">
              <Wifi className="h-4 w-4" />
              Connect
            </Button>
          ) : (
            <Button onClick={disconnect} variant="outline" className="gap-2 bg-transparent">
              <WifiOff className="h-4 w-4" />
              Disconnect
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Recording Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={startRecording} disabled={!connected || recording} className="flex-1 gap-2">
                {recording ? <Mic className="h-4 w-4 text-red-500" /> : <MicOff className="h-4 w-4" />}
                {recording ? "Recording..." : "Start Recording"}
              </Button>
              <Button
                onClick={stopRecording}
                disabled={!connected || !recording}
                variant="outline"
                className="flex-1 gap-2 bg-transparent"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
            </div>

            {recording && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Demo Audio Chunks
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {DEMO_AUDIO_CHUNKS.map((chunk, index) => (
                      <Button
                        key={index}
                        onClick={() => sendDemoAudio(chunk)}
                        variant="outline"
                        size="sm"
                        className="justify-start text-left h-auto p-3 bg-transparent"
                      >
                        <div>
                          <div className="font-medium text-xs text-muted-foreground mb-1">Chunk {index + 1}</div>
                          <div className="text-sm">{chunk}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Live Transcript
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {finalSegments.map((segment, index) => (
                  <div key={`final-${index}`} className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Final
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(segment.startMs)} - {formatTime(segment.endMs)}
                      </div>
                      <div className="text-xs text-muted-foreground">{formatTimestamp(segment.timestamp)}</div>
                    </div>
                    <p className="text-sm font-medium">{segment.text}</p>
                  </div>
                ))}

                {transcriptChunks.map((chunk) => (
                  <div
                    key={chunk.id}
                    className={cn(
                      "p-3 rounded-lg",
                      chunk.partial
                        ? "bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800"
                        : "bg-blue-50 dark:bg-blue-950/20",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={chunk.partial ? "secondary" : "outline"} className="text-xs">
                        {chunk.partial ? "Partial" : "Complete"}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(chunk.startMs)} - {formatTime(chunk.endMs)}
                      </div>
                      <div className="text-xs text-muted-foreground">{formatTimestamp(chunk.timestamp)}</div>
                    </div>
                    <p className={cn("text-sm", chunk.partial && "italic")}>{chunk.text}</p>
                  </div>
                ))}

                {transcriptChunks.length === 0 && finalSegments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                    <p>Start recording and send demo audio chunks to see transcription</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
