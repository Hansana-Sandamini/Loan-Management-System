import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { connectDB } from "./config/db"
import loanRoutes from "./routes/loan.route"

dotenv.config()

const PORT = process.env.PORT
const app = express()

app.use(express.json())
app.use(cors())

app.use("/api/loans", loanRoutes)

const startServer = async () => {
    try {
        await connectDB()
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    } catch (error) {
        console.error("Failed to start server:", error)
        process.exit(1)
    }
}

startServer()
