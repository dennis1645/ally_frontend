import {
  apiRequest,
} from "./apiClient";

import type {
  AuthUser,
} from "../types/auth";

export type UpdateProfilePayload = {
  name: string;
  phone_number: string;
  gender: string;
  headline: string;
  bio: string;
  linkedin_id: string;
  profile_picture?: File | null;
};

type UnknownRecord =
  Record<string, unknown>;

function isRecord(
  value: unknown,
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isAuthUser(
  value: unknown,
): value is AuthUser {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.name === "string" ||
    typeof value.email === "string"
  );
}

function extractUpdatedUser(
  response: unknown,
): AuthUser | null {
  if (!isRecord(response)) {
    return null;
  }

  const data = isRecord(response.data)
    ? response.data
    : null;

  const possibleUsers: unknown[] = [
    response.user,
    response.profile,
    data?.user,
    data?.profile,
    data,
  ];

  return (
    possibleUsers.find(isAuthUser) ??
    null
  );
}

function appendTextField(
  formData: FormData,
  key: string,
  value: string,
): void {
  /*
   * Do not append empty optional values.
   * Empty strings can fail backend format or enum validation.
   */
  const normalizedValue =
    value.trim();

  if (normalizedValue) {
    formData.append(
      key,
      normalizedValue,
    );
  }
}

export async function updateProfileApi(
  payload: UpdateProfilePayload,
): Promise<AuthUser | null> {
  const formData = new FormData();

  formData.append(
    "name",
    payload.name.trim(),
  );

  appendTextField(
    formData,
    "phone_number",
    payload.phone_number,
  );

  appendTextField(
    formData,
    "gender",
    payload.gender,
  );

  appendTextField(
    formData,
    "headline",
    payload.headline,
  );

  appendTextField(
    formData,
    "bio",
    payload.bio,
  );

  appendTextField(
    formData,
    "linkedin_id",
    payload.linkedin_id,
  );

  if (payload.profile_picture) {
    formData.append(
      "profile_picture",
      payload.profile_picture,
      payload.profile_picture.name,
    );
  }

  /*
   * Temporary development log.
   * This confirms exactly what is being sent.
   */
  if (import.meta.env.DEV) {
    console.group(
      "Update profile FormData",
    );

    formData.forEach(
      (value, key) => {
        if (value instanceof File) {
          console.log(key, {
            name: value.name,
            type: value.type,
            size: value.size,
          });
        } else {
          console.log(key, value);
        }
      },
    );

    console.groupEnd();
  }

  const response =
    await apiRequest<unknown>(
      "/api/update-profile",
      {
        method: "POST",
        body: formData,
      },
    );

  return extractUpdatedUser(
    response,
  );
}