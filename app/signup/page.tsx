
import { Suspense } from "react"
import SignupPage from "./SignupPage" // Adjust the path to your SignupPage component

export default function Signup() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignupPage />
        </Suspense>
    )
}
