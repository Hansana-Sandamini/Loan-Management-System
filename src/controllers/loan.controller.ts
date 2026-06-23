import { Request, Response } from "express"
import { Loan } from "../models/loan.model"
import { EmailType, sendEmailService } from "../config/mail"
import { console } from "inspector/promises"
import { Repayment } from "../models/repayment.model"

const fs = require('fs')
const path = require('path')

const calculateEMI = (amount: number): number => {
    return amount / 12
}

const saveInJson = async (data: any): Promise<void> => {
    const dir = path.join(__dirname, "../statements")

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }

    const filePath = path.join(dir, `${data.loanId}.json`)

    fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 2)
    )

    console.log("File created:", filePath)
}

const generateLoanStatement = async (
  loan: any
) => {
    const repayments = await Repayment.find({
        loanId: loan._id
    })

    return {
        loanId: loan._id,
        name: loan.name,
        email: loan.email,
        amount: loan.amount,
        emi: loan.emi,
        status: loan.status,
        repayments: repayments.map((r) => ({
            amount: r.amount,
            date: r.date
        }))
    }
}

export const createLoan = async (req: Request, res: Response) => {
    try {
        const { name, email, age, amount } = req.body

        if (!name || !email || !age || !amount) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" })
        }

        if (age < 18 || age > 90) {
            return res.status(400).json({ message: "Applicant must be between 18 and 90 years" })
        }

        const existingLoan = await Loan.findOne({ email })
        if (existingLoan) {
            return res.status(400).json({ message: "Loan with this email already exists" })
        }

        if (amount <= 0) {
            return res.status(400).json({ message: "Amount must be greater than zero" })
        }

        const emi = calculateEMI(amount)

        const loan = await Loan.create({ name, email, age, amount, emi })

        res.status(201).json({
            message: "Loan created successfully",
            data: loan,
        })

    } catch (err) {
        return res.status(500).json({ message: "Server error" })
    }
}

export const getLoanById = async (req: Request, res: Response) => {
    try {
        const loan = await Loan.findById(req.params.id)
        if (!loan) {
            return res.status(404).json({ message: "Loan not found" })
        }
        res.status(200).json({
            message: "Loan retrieved successfully",
            data: loan,
        })
    } catch (err) {
        return res.status(500).json({ message: "Server error" })
    }
}

export const getAllLoans = async (req: Request, res: Response) => {
    try {
        const loans = await Loan.find()
        res.status(200).json({
            message: "Loans retrieved successfully",
            data: loans,
        })
    } catch (err) {
        return res.status(500).json({ message: "Server error" })
    }
}

export const updateLoanStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { status } = req.body

        const loan = await Loan.findById(id)

        if (!loan) {
            return res.status(404).json({ message: "Loan not found" })
        }

        loan.status = status
        await loan.save()

        await sendEmailService(
            status === "APPROVED" ? EmailType.APPROVED : EmailType.REJECTED,
            loan.email,
            {
                loanId: loan._id.toString(),
                name: loan.name,
                amount: loan.amount,
                emi: loan.emi,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
            }
        )

        res.status(200).json({
            message: "Loan status updated successfully",
            data: loan,
        })
    } catch (err) {
        return res.status(500).json({ message: "Server error" })
    }
}

export const deleteLoan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const loan = await Loan.findByIdAndDelete(id)

        if (!loan) {
            return res.status(404).json({ message: "Loan not found" })
        }

        res.status(200).json({
            message: "Loan deleted successfully",
            data: loan,
        })
    } catch (err) {
        return res.status(500).json({ message: "Server error" })
    }
}

export const createRepayment = async (req: Request, res: Response) => {
    try {
        const { loanId, amount } = req.body

        if (!loanId || !amount) {
            return res.status(400).json({ message: "Loan ID and amount are required" })
        }

        const loan = await Loan.findById(loanId)

        if (!loan) {
            return res.status(404).json({ message: "Loan not found" })
        }

        if (amount <= 0) {
            return res.status(400).json({ message: "Amount must be greater than zero" })
        }

        res.status(201).json({
            message: "Repayment created successfully",
            data: { loanId, amount },
        })

        const repayment = await Repayment.create({ loanId, amount, date: new Date() })
        console.log(`Repayment created for loan ID ${loanId} with amount ${amount}`)
        const loanStatement = await generateLoanStatement(loan)
        await saveInJson(loanStatement)

    } catch (err) {
        return res.status(500).json({ message: "Server error" })
    }
}

export const getScheduledRepayments = async (req: Request, res: Response) => {
    try {
        const repayments = await Repayment.find().populate("loanId")

        res.status(200).json({
            message: "Scheduled repayments retrieved successfully",
            data: { repayments },
        })
    } catch (err) {
        return res.status(500).json({ message: "Server error" })
    }
}
