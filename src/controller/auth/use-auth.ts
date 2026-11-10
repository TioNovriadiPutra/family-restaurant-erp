import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useEffect } from "react";
import { getSession, login, logout } from "@/services/auth.service";
import type { ApiErrorResponse, AuthSession, LoginCredentials } from "@/interfaces/auth";

export function authErrorMessage(error: unknown) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? "Koneksi terputus. Periksa jaringan lalu coba lagi.";
  }
  return "Terjadi kesalahan. Silakan coba lagi.";
}

export function useLogin() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { session } = await login(credentials);
      const outlets = Array.from(new Map(session.access.map(access => [access.outlet_id, access])).values());
      return { session, outlets };
    },
    retry: false,
    gcTime: 0,
    onSuccess() { cache.clear(); },
  });
}
export function useAuthSession(initialData?: AuthSession) {
  const cache = useQueryClient();
  useEffect(() => {
    if (initialData) cache.setQueryData(["auth", "session"], { session: initialData });
  }, [initialData, cache]);
  return useQuery({
    queryKey: ["auth", "session"], queryFn: getSession,
    select: response => response.session,
    initialData: initialData ? { session: initialData } : undefined,
    staleTime: 60_000, retry: false,
  });
}
export function useLogout() {
  const cache = useQueryClient();
  return useMutation({ mutationFn: logout, retry: false, onSuccess() {
    cache.clear();
    window.location.replace("/login");
  } });
}
