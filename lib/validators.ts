// Email: Non-empty, valid format
export const validateEmail = (email: string): string | null => {
    if (!email) return "Email is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return "Please enter a valid email address"
    return null
}

// Password: Non-empty, at least 8 characters, 1 letter, 1 number
export const validatePassword = (password: string): string | null => {
    if (!password) return "Password is required"
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(password)) {
        return "Password must be at least 8 characters with 1 letter and 1 number"
    }
    return null
}

// Full Name: Non-empty, at least 2 characters, letters and spaces only
export const validateFullName = (fullName: string): string | null => {
    if (!fullName) return "Full name is required"
    const nameRegex = /^[A-Za-z\s]{2,}$/
    if (!nameRegex.test(fullName)) {
        return "Full name must be at least 2 characters and contain only letters and spaces"
    }
    return null
}
