import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";

export function PageFrame({ section, title, description, action, children }) {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "flex-start" }}
          spacing={1.5}
        >
          <Box>
            <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 700, lineHeight: 1.2 }}>
              {section}
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 760 }}>
              {description}
            </Typography>
          </Box>
          {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
        </Stack>
        {children}
      </Stack>
    </Box>
  );
}

export function SectionCard({ title, description, children, actions, sx }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, ...sx }}>
      <Stack spacing={2.5} sx={{ height: "100%", minHeight: 0 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h6" fontWeight={800}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          </Box>
          {actions}
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}

export function MetricCard({ icon, title, value, caption }) {
  return (
    <Card variant="outlined" sx={{ height: "100%", borderRadius: 4 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {caption}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 52,
              height: 52,
              display: "grid",
              placeItems: "center",
              borderRadius: 3,
              bgcolor: "primary.50",
              color: "primary.main"
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function SimpleTable({ columns, rows, emptyText = "Belum ada data.", tableSx }) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, ...tableSx }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.key} align={column.align || "left"}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <TableRow key={row.id ?? index} hover>
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.align || "left"}>
                    {column.render ? column.render(row) : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                {emptyText}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function ModuleCard({ title, description, icon, to, chip }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 4, height: "100%" }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                display: "grid",
                placeItems: "center",
                borderRadius: 3,
                bgcolor: "secondary.50",
                color: "secondary.main"
              }}
            >
              {icon}
            </Box>
            {chip ? <Chip label={chip} size="small" color="primary" variant="outlined" /> : null}
          </Stack>
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {description}
            </Typography>
          </Box>
          <Link component={RouterLink} to={to} underline="hover" sx={{ fontWeight: 700 }}>
            Buka modul
          </Link>
        </Stack>
      </CardContent>
    </Card>
  );
}
