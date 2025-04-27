export async function fetchWithRefresh(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = localStorage.getItem("token")
    const headers = {
        ...options.headers,
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    const response = await fetch(url, { ...options, headers })

    if (response.status === 401) {
        // Try to refresh token
        const refreshResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // Include cookies
            }
        )

        if (!refreshResponse.ok) {
            localStorage.removeItem("token")
            localStorage.removeItem("classroomId")
            window.location.href = "/login?error=Session%20expired"
            throw new Error("Failed to refresh token")
        }

        const { data } = await refreshResponse.json()
        localStorage.setItem("token", data.token)
        localStorage.setItem("classroomId", data.classroomId)

        // Update refresh token cookie
        await fetch("/api/auth/set-refresh-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: data.refreshToken }),
        })

        // Retry original request with new token
        const retryResponse = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                "Content-Type": "application/json",
                Authorization: `Bearer ${data.token}`,
            },
        })

        return retryResponse
    }

    return response
}
