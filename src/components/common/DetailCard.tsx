import type React from "react"
import type { ReactNode } from "react"
import { Paper, Typography, Box, type SxProps, type Theme } from "@mui/material"

interface DetailCardProps {
  title: string
  icon?: ReactNode
  children: ReactNode
  sx?: SxProps<Theme>
}

export const DetailCard: React.FC<DetailCardProps> = ({ title, icon, children, sx }) => {
  return (
    <Paper sx={{ p: 2, height: "100%", ...sx }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
        <Typography variant="subtitle1">{title}</Typography>
      </Box>
      {children}
    </Paper>
  )
}

interface DetailItemProps {
  label: string
  value: ReactNode
  gutterBottom?: boolean
}

export const DetailItem: React.FC<DetailItemProps> = ({ label, value, gutterBottom = true }) => {
  return (
    <>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" gutterBottom={gutterBottom}>
        {value}
      </Typography>
    </>
  )
}
