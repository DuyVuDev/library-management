import type React from "react"
import { Chip, type ChipProps } from "@mui/material"
import { RequestStatus, BorrowingStatus } from "../../types/bookRequest"

interface StatusChipProps extends Omit<ChipProps, "color"> {
  status: RequestStatus | BorrowingStatus | string
  type: "request" | "borrowing"
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, type, ...props }) => {
  let color: ChipProps["color"] = "default"
  let label = status.toString()

  if (type === "request") {
    switch (status as RequestStatus) {
      case RequestStatus.Approved:
        color = "success"
        label = "Approved"
        break
      case RequestStatus.Rejected:
        color = "error"
        label = "Rejected"
        break
      case RequestStatus.Waiting:
        color = "warning"
        label = "Waiting"
        break
      default:
        if (typeof status === "string") {
          label = status
        } else {
          label = RequestStatus[status as RequestStatus] || "Unknown"
        }
    }
  } else if (type === "borrowing") {
    switch (status as BorrowingStatus) {
      case BorrowingStatus.Borrowing:
        color = "primary"
        label = "Borrowing"
        break
      case BorrowingStatus.Returned:
        color = "success"
        label = "Returned"
        break
      case BorrowingStatus.Overdue:
        color = "error"
        label = "Overdue"
        break
      case BorrowingStatus.Rejected:
        color = "error"
        label = "Rejected"
        break
      case BorrowingStatus.WaitingForReturnApproval:
        color = "info"
        label = "Return Pending"
        break
      case BorrowingStatus.WaitingForRenewalApproval:
        color = "secondary"
        label = "Renewal Pending"
        break
      case BorrowingStatus.Waiting:
        color = "warning"
        label = "Waiting"
        break
      default:
        if (typeof status === "string") {
          label = status
        } else {
          label = BorrowingStatus[status as BorrowingStatus] || "Unknown"
        }
    }
  }

  return <Chip label={label} color={color} size="small" {...props} />
}
