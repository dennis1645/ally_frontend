import { apiRequest } from "./apiClient";

export type ChangePasswordPayload = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

export type ChangePasswordResponse = {
  message?: string;
  data?: unknown;
};

export async function changePasswordApi(
  payload: ChangePasswordPayload,
): Promise<ChangePasswordResponse> {
  return apiRequest<ChangePasswordResponse>(
    "/api/change-password",
    {
      method: "POST",

      body: JSON.stringify(
        payload,
      ),
    },
  );
}