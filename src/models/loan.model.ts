import mongoose, { Document, Schema } from "mongoose"

export enum LoanStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}

export interface ILoan extends Document {
    _id: mongoose.Types.ObjectId
    name: string
    email: string
    age: number
    amount: number
    emi: number
    status: LoanStatus
}

const loanSchema = new Schema<ILoan>(
    {
        name: { type: String, required: true },
        email: {
            type: String,
            required: true,
            lowercase: true
        },
        age: { type: Number, required: true },
        amount: { type: Number, required: true },
        emi: { type: Number, required: true },
        status: {
            type: String,
            enum: Object.values(LoanStatus),
            default: LoanStatus.PENDING
        }
    },
    { timestamps: true }
)

export const Loan = mongoose.model<ILoan>("Loan", loanSchema)
