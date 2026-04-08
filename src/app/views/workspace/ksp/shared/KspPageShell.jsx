import { Box, Stack, Typography } from "@mui/material";

export default function KspPageShell({ eyebrow = "KSP", title, description, action, children }) {
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
              {eyebrow}
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
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
