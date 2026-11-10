import type { IncomingMessage, ServerResponse } from "node:http";
import type { InputHTMLAttributes, ReactNode } from "react";

export interface LoginCredentials { email: string; password: string }
export interface OutletAccess {
  employee_id: string;
  restaurant_id: string;
  outlet_id: string;
  outlet_name: string;
  role: string;
  permissions: string[];
}
export interface AuthSession { user: { id: string; email: string }; access: OutletAccess[] }
export interface AuthResponse { session: AuthSession }
export interface ApiErrorResponse { message: string }
export interface ServerAuthContext { req: IncomingMessage; res: ServerResponse }
export interface AuthShellProps { children: ReactNode }
export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}
