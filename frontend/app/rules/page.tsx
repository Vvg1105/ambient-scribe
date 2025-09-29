"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AntibioticsRulesForm } from "@/components/rules/antibiotics-rules-form"
import { Shield } from "lucide-react"

export default function RulesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clinical Rules</h1>
          <p className="text-muted-foreground">
            Analyze medications and allergies for potential interactions and contraindications
          </p>
        </div>

        <Tabs defaultValue="antibiotics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="antibiotics" className="gap-2">
              <Shield className="h-4 w-4" />
              Antibiotics Rules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="antibiotics">
            <Card>
              <CardHeader>
                <CardTitle>Antibiotics Safety Check</CardTitle>
              </CardHeader>
              <CardContent>
                <AntibioticsRulesForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}