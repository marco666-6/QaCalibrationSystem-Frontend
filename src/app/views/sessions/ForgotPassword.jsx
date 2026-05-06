import { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import { useForgotPassword } from "app/hooks/useProfile";
import AuthLayout from "./components/AuthLayout";

const initialValues = {
  email: ""
};

const validationSchema = Yup.object({
  email: Yup.string().email("Enter a valid email").required("Email is required")
});

export default function ForgotPassword() {
  const forgotPasswordMutation = useForgotPassword();
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (values, { resetForm }) => {
    const response = await forgotPasswordMutation.mutateAsync({
      email: values.email.trim()
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
      subtitle="Enter the email address attached to your calibration account."
      image="/assets/images/icon.svg"
      imageAlt="Calibration auth"
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
              name="email"
              label="Email"
              type="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(touched.email && errors.email)}
              helperText={touched.email && errors.email}
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
