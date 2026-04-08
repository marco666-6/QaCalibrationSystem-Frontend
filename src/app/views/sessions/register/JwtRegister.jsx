import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import useAuth from "app/hooks/useAuth";
import { getTenantCode } from "/src/api/auth";
import { Paragraph } from "app/components/Typography";
import AuthLayout from "../components/AuthLayout";

const initialValues = {
  tenantCode: getTenantCode(),
  memberNo: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: ""
};

const validationSchema = Yup.object({
  tenantCode: Yup.string().required("Tenant code is required"),
  memberNo: Yup.string().max(50, "Member number is too long").required("Member number is required"),
  email: Yup.string().email("Enter a valid email").required("Email is required"),
  username: Yup.string().max(100, "Username is too long").required("Username is required"),
  password: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password")
});

export default function JwtRegister() {
  const navigate = useNavigate();
  const { register, isAuthenticated, user } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    navigate(user?.mustChangePassword ? "/account/change-password" : "/", { replace: true });
  }, [isAuthenticated, navigate, user?.mustChangePassword]);

  const handleSubmit = async (values) => {
    setErrorMessage("");

    try {
      await register(
        values.email.trim(),
        values.username.trim(),
        values.password,
        values.confirmPassword,
        values.memberNo.trim(),
        values.tenantCode.trim()
      );
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || error.message || "Registration failed.");
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Registrasi member self-service sesuai endpoint `register-member`."
      image="/assets/images/icon.svg"
      imageAlt="Koperasi register"
      footer={
        <Paragraph color="text.secondary">
          Already have an account?
          <Link component={NavLink} to="/session/signin" sx={{ ml: 0.75 }}>
            Sign in
          </Link>
        </Paragraph>
      }
    >
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
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
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
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
              name="memberNo"
              label="Member Number"
              value={values.memberNo}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(touched.memberNo && errors.memberNo)}
              helperText={touched.memberNo && errors.memberNo}
              sx={{ mb: 2 }}
            />

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
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              size="small"
              name="username"
              label="Username"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(touched.username && errors.username)}
              helperText={touched.username && errors.username}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              size="small"
              name="password"
              label="Password"
              type="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(touched.password && errors.password)}
              helperText={touched.password && errors.password}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              size="small"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={Boolean(touched.confirmPassword && errors.confirmPassword)}
              helperText={touched.confirmPassword && errors.confirmPassword}
              sx={{ mb: 3 }}
            />

            <LoadingButton fullWidth type="submit" variant="contained" loading={isSubmitting} sx={{ py: 1.1 }}>
              Create Account
            </LoadingButton>
          </form>
        )}
      </Formik>
    </AuthLayout>
  );
}
