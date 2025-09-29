"use client"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExtractSOAPForm } from "@/components/soap/extract-soap-form"
import { GetSOAPForm } from "@/components/soap/get-soap-form"
import { FileText, Search } from "lucide-react"

export default function SOAPPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">SOAP Notes</h1>
          <p className="text-muted-foreground">Extract and manage SOAP notes from clinical transcripts</p>
        </div>

        <Tabs defaultValue="extract" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="extract" className="gap-2">
              <FileText className="h-4 w-4" />
              Extract SOAP
            </TabsTrigger>
            <TabsTrigger value="retrieve" className="gap-2">
              <Search className="h-4 w-4" />
              Get SOAP by Encounter
            </TabsTrigger>
          </TabsList>

          <TabsContent value="extract">
            <Card>
              <CardHeader>
                <CardTitle>Extract SOAP Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <ExtractSOAPForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="retrieve">
            <Card>
              <CardHeader>
                <CardTitle>Retrieve SOAP Notes by Encounter</CardTitle>
              </CardHeader>
              <CardContent>
                <GetSOAPForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}