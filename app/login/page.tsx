
import { Suspense } from "react"
import LoginPage from "./LoginPage" // Adjust the path to your LoginPage component

export default function Signup() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginPage />
        </Suspense>
    )
}
