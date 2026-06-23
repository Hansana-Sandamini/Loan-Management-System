import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

export const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

export enum EmailType {
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}

interface EmailOptions {
    to: string
    subject: string
    html: string
    text?: string
}

interface Loan {
    name: string
    amount: string | number
    emi: string | number
    dueDate: string
}

const sendEmail = async (options: EmailOptions): Promise<boolean> => {
    try {
        const mailOptions = {
            from: `"Loan System" <${process.env.SMTP_USER}>`,
            ...options
        }

        const info = await mailTransporter.sendMail(mailOptions)
        console.log(`Email sent to ${options.to}: ${info.messageId}`)
        return true
    } catch (error) {
        console.error("Error sending email:", error)
        throw error
    }
}


export const sendEmailService = async (
    type: EmailType,
    to: string,
    data: Loan & { loanId: string }
): Promise<boolean> => {
    let emailOptions: EmailOptions

    switch (type) {
        case EmailType.APPROVED:
            emailOptions = getApprovedEmail(to, data.loanId, data)
            break
        case EmailType.REJECTED:
            emailOptions = getRejectedEmail(to, data.loanId, data)
            break       
        default:
            throw new Error("Unknown email type")

    }

    return await sendEmail(emailOptions)
}


export const EmailService = {
    send: sendEmailService,
    types: EmailType,
}

const getApprovedEmail = (to: string, loanId: string, loanData?: Loan): EmailOptions => {
    return {
        to,
        subject: "Loan Approved",
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #4CAF50;">Congratulations!</h2>
                <p>Your loan with ID <strong>${loanId}</strong> has been approved.</p>
                <p>Loan Details:</p>
                <ul>
                    <li>Loan ID: ${loanId}</li>
                    <li>Customer Name: ${loanData?.name ?? "N/A"}</li>
                    <li>Loan Amount: ${loanData?.amount ?? "N/A"}</li>
                    <li>EMI Amount: ${loanData?.emi ?? "N/A"}</li>
                    <li>Due Date: ${loanData?.dueDate ?? "N/A"}</li>
                </ul>
                <p>Please contact our support team for further assistance.</p>
            </div>
        `,
        text: `
            Congratulations! Your loan with ID ${loanId} has been approved.
        `
    }
}

const getRejectedEmail = (to: string, loanId: string, loanData?: Loan): EmailOptions => {
    return {
        to,
        subject: "Loan Rejected",
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #f44336;">Sorry!</h2>
                <p>Your loan with ID <strong>${loanId}</strong> has been rejected.</p>
                <p>Loan Details:</p>
                <ul>
                    <li>Loan ID: ${loanId}</li>
                    <li>Customer Name: ${loanData?.name ?? "N/A"}</li>
                    <li>Loan Amount: ${loanData?.amount ?? "N/A"}</li>
                    <li>EMI Amount: ${loanData?.emi ?? "N/A"}</li>
                    <li>Due Date: ${loanData?.dueDate ?? "N/A"}</li>
                </ul>
                <p>Thank you for considering our service.</p>
            </div>
        `,
        text: `
            <p>Your loan with ID ${loanId} has been rejected.</p>
        `
    }
}
