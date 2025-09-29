import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect to patients page as the default landing
  redirect("/patients")
}