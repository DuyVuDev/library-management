"use client"

import type React from "react"
import { Alert, type AlertProps, Snackbar, type SnackbarProps } from "@mui/material"

export interface NotificationState {
  open: boolean
  message: string
  severity: AlertProps["severity"]
}

interface NotificationProps {
  notification: NotificationState | null
  onClose: () => void
  autoHideDuration?: SnackbarProps["autoHideDuration"]
  anchorOrigin?: SnackbarProps["anchorOrigin"]
}

export const Notification: React.FC<NotificationProps> = ({
  notification,
  onClose,
  autoHideDuration = 6000,
  anchorOrigin = { vertical: "bottom", horizontal: "right" },
}) => {
  if (!notification) return null

  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
    >
      <Alert onClose={onClose} severity={notification.severity} sx={{ width: "100%" }}>
        {notification.message}
      </Alert>
    </Snackbar>
  )
}
