import axios from "axios"
const dev = "http://localhost:3000"
const production = "https://audit-tracker-admin.firebaseapp.com/"
export default axios.create({
    baseURL: production,
    headers: {
        "Content-Type": "application/json",
      },
})