import { redirect } from "next/navigation";
import MainLandingPage from "./(screens)/landing_page/page";

export default function Page() {
  return (
    // redirect("/login")
    redirect('/landing_page')
  )
}

