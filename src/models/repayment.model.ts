import mongoose, { Document, Schema } from "mongoose"

export interface IRepayment extends Document {
    _id: mongoose.Types.ObjectId
    loanId: mongoose.Types.ObjectId
    amount: number
    date: Date
}

const repaymentSchema = new Schema<IRepayment>(
    {
        loanId: {
            type: Schema.Types.ObjectId,
            ref: "Loan",
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
)

export const Repayment = mongoose.model<IRepayment>("Repayment", repaymentSchema)
