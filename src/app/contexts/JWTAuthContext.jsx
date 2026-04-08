import { createContext, useEffect, useReducer } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Loading from "app/components/MatxLoading";
import { getTenantCode, loginUser, registerMember } from "/src/api/auth";
import { getMyProfile } from "/src/api/profile";

const initialState = {
  user: null,
  isInitialized: false,
  isAuthenticated: false
};

const claim = (decodedToken, ...keys) => {
  for (const key of keys) {
    if (decodedToken?.[key] !== undefined) return decodedToken[key];
  }
  return undefined;
};

const isValidToken = (accessToken) => {
  if (!accessToken) return false;
  const decodedToken = jwtDecode(accessToken);
  return Boolean(decodedToken?.sub);
};

const setSession = (accessToken, refreshToken) => {
  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    return;
  }

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  delete axios.defaults.headers.common.Authorization;
};

const buildUser = (data) => ({
  id: data.userId ?? data.id,
  username: data.username,
  fullName: data.displayName ?? data.fullName ?? data.name,
  displayName: data.displayName ?? data.fullName ?? data.name,
  email: data.email,
  role: Array.isArray(data.roles) ? data.roles[0] : data.role,
  roles: data.roles ?? (data.role ? [data.role] : []),
  employeeId: data.employeeCode ?? data.employeeId,
  tenantId: data.tenantId,
  tenantCode: data.tenantCode ?? getTenantCode(),
  userType: data.userType,
  memberId: data.memberId,
  mustChangePassword: Boolean(data.mustChangePassword),
  isActive: data.isActive,
  phoneNumber: data.phoneNumber
});

const reducer = (state, action) => {
  switch (action.type) {
    case "INIT":
      return { ...state, user: action.payload.user, isAuthenticated: action.payload.isAuthenticated, isInitialized: true };
    case "LOGIN":
    case "REGISTER":
      return { ...state, user: action.payload.user, isAuthenticated: true };
    case "LOGOUT":
      return { ...state, isAuthenticated: false, user: null };
    default:
      return state;
  }
};

const AuthContext = createContext({
  ...initialState,
  method: "JWT"
});

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const login = async (username, password) => {
    const response = await loginUser({ username, password });
    const { success, message, data } = response;
    if (!success) throw new Error(message || "Invalid username or password.");

    setSession(data.token, data.refreshToken);
    dispatch({ type: "LOGIN", payload: { user: buildUser(data) } });
  };

  const register = async (
    email,
    username,
    password,
    confirmPassword = password,
    memberNo = username,
    tenantCode = getTenantCode()
  ) => {
    const response = await registerMember({
      tenantCode,
      memberNo,
      username,
      email,
      password,
      confirmPassword
    });
    const { success, message, data } = response;
    if (!success) throw new Error(message || "Registration failed.");

    setSession(data.token, data.refreshToken);
    dispatch({ type: "REGISTER", payload: { user: buildUser(data) } });
  };

  const logout = () => {
    setSession(null);
    dispatch({ type: "LOGOUT" });
  };

  const refreshUser = (userData) => {
    dispatch({ type: "LOGIN", payload: { user: buildUser(userData) } });
  };

  useEffect(() => {
    (async () => {
      try {
        const accessToken = window.localStorage.getItem("accessToken");

        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken);
          const decoded = jwtDecode(accessToken);
          let user;

          try {
            const profileResponse = await getMyProfile();
            user = buildUser(profileResponse?.data ?? profileResponse);
          } catch (profileError) {
            console.warn("Falling back to JWT claims for user initialization.", profileError);
            user = buildUser({
              id: claim(decoded, "sub", "nameid"),
              username: claim(decoded, "unique_name", "username"),
              displayName: claim(decoded, "name", "display_name", "fullName"),
              email: claim(decoded, "email"),
              roles: claim(decoded, "roles") ?? [
                claim(decoded, "role", "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")
              ].filter(Boolean),
              employeeCode: claim(decoded, "employee_code", "employeeId"),
              tenantId: claim(decoded, "tenant_id", "tenantId"),
              memberId: claim(decoded, "member_id", "memberId"),
              userType: claim(decoded, "user_type", "userType"),
              mustChangePassword: claim(decoded, "mustChangePassword", "must_change_password", "force_password_change")
            });
          }

          dispatch({ type: "INIT", payload: { isAuthenticated: true, user } });
          return;
        }

        dispatch({ type: "INIT", payload: { isAuthenticated: false, user: null } });
      } catch (error) {
        console.error(error);
        dispatch({ type: "INIT", payload: { isAuthenticated: false, user: null } });
      }
    })();
  }, []);

  if (!state.isInitialized) return <Loading />;

  return (
    <AuthContext.Provider value={{ ...state, method: "JWT", login, logout, refreshUser, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
