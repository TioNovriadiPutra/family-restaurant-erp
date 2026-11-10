import { httpClient } from "@/lib/http";
import type { AuthResponse, LoginCredentials } from "@/interfaces/auth";

export async function login(credentials: LoginCredentials) {
  return (await httpClient.post<AuthResponse>("/auth/login", credentials)).data;
}
export async function getSession() {
  return (await httpClient.get<AuthResponse>("/auth/session")).data;
}
export async function logout() {
  await httpClient.post("/auth/logout", {});
}
