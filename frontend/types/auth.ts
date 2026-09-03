export type UserRole = "Admin" | "Operator";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginResult {
  user: AuthenticatedUser;
}
