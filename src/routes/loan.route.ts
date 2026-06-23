import { Router } from "express"
import { 
    createLoan, 
    createRepayment, 
    deleteLoan, 
    getAllLoans, 
    getLoanById, 
    getScheduledRepayments, 
    updateLoanStatus 

} from "../controllers/loan.controller"

const router = Router()

router.post("/", createLoan)
router.get("/:id", getLoanById)
router.get("/", getAllLoans)
router.patch("/:id", updateLoanStatus)
router.delete("/:id", deleteLoan)
router.post("/:id/repay", createRepayment)
router.get("/:id/schedule", getScheduledRepayments)

export default router
