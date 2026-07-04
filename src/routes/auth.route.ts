export const authPrefix = "/auth";
export const authRoute = {
  REGISTER: `${authPrefix}/register`,
  LOGIN: `${authPrefix}/login`,
  LOGOUT: `${authPrefix}/logout`,
} as const;
