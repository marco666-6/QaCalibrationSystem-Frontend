import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material";

export default function KspSimpleDialog({
  title,
  open,
  onClose,
  onSubmit,
  isPending,
  fields,
  initialData = {},
  mode = "create"
}) {
  const [form, setForm] = useState({});

  useEffect(() => {
    const next = {};
    fields.forEach((field) => {
      next[field.name] = initialData[field.name] ?? field.defaultValue ?? "";
    });
    setForm(next);
  }, [fields, initialData]);

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>{mode === "edit" ? `Edit ${title}` : `Tambah ${title}`}</DialogTitle>
      <DialogContent dividers>
        <Grid2 container spacing={2} sx={{ mt: 0.5 }}>
          {fields.map((field) => (
            <Grid2 key={field.name} size={field.size || { xs: 12, md: 6 }}>
              {field.type === "switch" ? (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ pt: 1 }}>
                  <Switch
                    checked={Boolean(form[field.name])}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, [field.name]: event.target.checked }))
                    }
                  />
                  <Typography>{form[field.name] ? "Aktif" : "Nonaktif"}</Typography>
                </Stack>
              ) : (
                <TextField
                  fullWidth
                  multiline={field.multiline}
                  minRows={field.multiline ? 2 : undefined}
                  select={field.type === "select"}
                  type={field.type === "date" || field.type === "number" ? field.type : "text"}
                  label={field.label}
                  value={form[field.name] ?? ""}
                  InputLabelProps={field.type === "date" ? { shrink: true } : undefined}
                  disabled={field.disabledOnEdit && mode === "edit"}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                >
                  {field.options?.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Grid2>
          ))}
        </Grid2>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Batal
        </Button>
        <Button variant="contained" onClick={() => onSubmit(form)} disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
