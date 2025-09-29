"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LiveTranscriptionDemo } from "@/components/transcription/live-transcription-demo"
import { Mic } from "lucide-react"

export default function TranscriptionPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Live Transcription</h1>
          <p className="text-muted-foreground">Real-time WebSocket transcription demo for testing audio streaming</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              WebSocket Transcription Demo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LiveTranscriptionDemo />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}