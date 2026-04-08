import { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import { getTenantCode } from "/src/api/auth";
import { useForgotPassword } from "app/hooks/useProfile";
import AuthLayout from "./components/AuthLayout";

const initialValues = {
  tenantCode: getTenantCode(),
  usernameOrEmail: ""
};

const validationSchema = Yup.object({
  tenantCode: Yup.string().required("Tenant code is required"),
  usernameOrEmail: Yup.string().required("Username atau email wajib diisi")
});

export default function ForgotPassword() {
  const forgotPasswordMutation = useForgotPassword();
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (values, { resetForm }) => {
    const response = await forgotPasswordMutation.mutateAsync({
      tenantCode: values.tenantCode.trim(),
      usernameOrEmail: values.usernameOrEmail.trim()
    });

    setSuccessMessage(
      response?.message ||
      "Jika akun ditemukan, instruksi reset password sudah dikirim."
    );
    resetForm();
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Masukkan tenant code dan username atau email sesuai kontrak backend autentikasi."
      image="/assets/images/icon.svg"
      imageAlt="Koperasi auth"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          isSubmitting,
          handleBlur,
          handleChange,
          handleSubmit: submitForm
        }) => (
          <form onSubmit={submitForm}>
            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMessage}
              </Alert>
            )}

            <TextField
              fullWidth
              size="small"
              name="tenantCode"
              label="Tenant Code"
              value={values.tenantCode}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(touched.tenantCode && errors.tenantCode)}
              helperText={touched.tenantCode && errors.tenantCode}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              size="small"
              name="usernameOrEmail"
              label="Username atau Email"
              value={values.usernameOrEmail}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(touched.usernameOrEmail && errors.usernameOrEmail)}
              helperText={touched.usernameOrEmail && errors.usernameOrEmail}
              sx={{ mb: 3 }}
            />

            <LoadingButton
              fullWidth
              type="submit"
              variant="contained"
              loading={isSubmitting || forgotPasswordMutation.isPending}
              sx={{ py: 1.1 }}
            >
              Send Reset Instructions
            </LoadingButton>
          </form>
        )}
      </Formik>
    </AuthLayout>
  );
}
