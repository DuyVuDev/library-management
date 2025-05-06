import type React from "react";
import { Box, Typography } from "@mui/material";
import {
  type BookBorrowingRequestDetailResponseDTO,
  BorrowingStatus,
} from "../../types/bookRequest";
import { DetailCard, DetailItem } from "../common/DetailCard";
import { StatusChip } from "../common/StatusChip";
import { formatDate } from "../../utils/format-utils";

interface BookDetailViewProps {
  detail: BookBorrowingRequestDetailResponseDTO;
}

export const BookDetailView: React.FC<BookDetailViewProps> = ({ detail }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ width: "100%" }}>
        <DetailCard title="Book Information">
          <DetailItem label="Book ID" value={detail.bookId} />
          <DetailItem
            label="Title"
            value={detail.bookTitle}
            gutterBottom={false}
          />
        </DetailCard>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <DetailCard title="Status">
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <StatusChip status={detail.borrowingStatus} type="borrowing" />
              <Typography variant="body1" sx={{ ml: 1 }}>
                {BorrowingStatus[detail.borrowingStatus]}
              </Typography>
            </Box>
          </DetailCard>
        </Box>

        <Box sx={{ flex: 1 }}>
          <DetailCard title="Due Date">
            <Typography variant="body1">
              {formatDate(detail.dueDate)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Renewed: {detail.isDueDateRenewed ? "Yes" : "No"}
            </Typography>
          </DetailCard>
        </Box>
      </Box>

      <Box sx={{ width: "100%" }}>
        <DetailCard title="Approval Information">
          <DetailItem
            label="Approver ID"
            value={detail.approverId || "Not approved yet"}
          />
          <DetailItem
            label="Approver Name"
            value={detail.approverName || "N/A"}
            gutterBottom={false}
          />
        </DetailCard>
      </Box>

      <Box sx={{ width: "100%" }}>
        <DetailCard title="Request Information">
          <DetailItem
            label="Request ID"
            value={detail.bookBorrowingRequestId}
            gutterBottom={false}
          />
        </DetailCard>
      </Box>
    </Box>
  );
};
