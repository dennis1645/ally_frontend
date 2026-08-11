import {
  apiRequest,
} from "./apiClient";

export type VaultDocument = {
  id:
    string | number;

  fileName:
    string;

  documentType:
    string | null;

  mimeType:
    string | null;

  sizeBytes:
    number | null;

  uploadedAt:
    string | null;

  status:
    string | null;

  scholarshipId:
    string | number | null;

  scholarshipName:
    string | null;

  universityId:
    string | number | null;

  universityName:
    string | null;

  previewUrl:
    string | null;

  downloadUrl:
    string | null;

  signedUrl:
    string | null;

  raw:
    Record<string, unknown>;
};

export type UploadVaultDocumentPayload = {
  file:
    File;

  scholarshipId?:
    string | number | null;

  universityId?:
    string | number | null;
};

function isRecord(
  value:
    unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value,
    )
  );
}

function asString(
  value:
    unknown,
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const normalized =
    value.trim();

  return normalized ||
    null;
}

function asNumber(
  value:
    unknown,
): number | null {
  if (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  ) {
    return value;
  }

  if (
    typeof value ===
      "string" &&
    value.trim()
  ) {
    const parsed =
      Number(
        value,
      );

    return Number.isFinite(
      parsed,
    )
      ? parsed
      : null;
  }

  return null;
}

function asId(
  value:
    unknown,
): string | number | null {
  if (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  ) {
    return value;
  }

  if (
    typeof value ===
      "string" &&
    value.trim()
  ) {
    return value.trim();
  }

  return null;
}

function firstString(
  ...values:
    unknown[]
): string | null {
  for (
    const value of
    values
  ) {
    const normalized =
      asString(
        value,
      );

    if (
      normalized
    ) {
      return normalized;
    }
  }

  return null;
}

function nestedRecord(
  value:
    unknown,
): Record<
  string,
  unknown
> | null {
  return isRecord(
    value,
  )
    ? value
    : null;
}

function basename(
  value:
    string,
): string {
  const normalized =
    value
      .replaceAll(
        "\\",
        "/",
      )
      .split(
        "/",
      )
      .filter(
        Boolean,
      )
      .pop();

  return (
    normalized ||
    value
  );
}

function normalizeVaultDocument(
  value:
    unknown,
): VaultDocument | null {
  if (
    !isRecord(
      value,
    )
  ) {
    return null;
  }

  const id =
    asId(
      value.id ??
        value.vault_id ??
        value.document_id,
    );

  if (
    id ===
      null
  ) {
    return null;
  }

  const scholarship =
    nestedRecord(
      value.scholarship,
    );

  const university =
    nestedRecord(
      value.university,
    );

  const links =
    nestedRecord(
      value.links,
    );

  const rawName =
    firstString(
      value.file_name,
      value.original_name,
      value.original_filename,
      value.document_name,
      value.filename,
      value.name,
      value.file,
      value.file_path,
      value.path,
    );

  const fileName =
    rawName
      ? basename(
          rawName,
        )
      : `Document ${String(
          id,
        )}`;

  return {
    id,

    fileName,

    documentType:
      firstString(
        value.document_type,
        value.type,
        value.category,
      ),

    mimeType:
      firstString(
        value.mime_type,
        value.mime,
        value.content_type,
      ),

    sizeBytes:
      asNumber(
        value.file_size ??
          value.size ??
          value.size_bytes,
      ),

    uploadedAt:
      firstString(
        value.uploaded_at,
        value.created_at,
        value.updated_at,
      ),

    /*
     * Status is displayed only when the backend actually returns it.
     * No frontend review/pending state is invented.
     */
    status:
      firstString(
        value.status,
        value.document_status,
        value.review_status,
      ),

    scholarshipId:
      asId(
        value.scholarship_id ??
          scholarship?.id,
      ),

    scholarshipName:
      firstString(
        value.scholarship_name,
        scholarship?.name,
        scholarship?.title,
      ),

    universityId:
      asId(
        value.university_id ??
          university?.id,
      ),

    universityName:
      firstString(
        value.university_name,
        university?.name,
        university?.title,
      ),

    previewUrl:
      firstString(
        value.preview_url,
        value.previewUrl,
        links?.preview,
        links?.preview_url,
      ),

    downloadUrl:
      firstString(
        value.download_url,
        value.downloadUrl,
        links?.download,
        links?.download_url,
      ),

    /*
     * A signed URL is consumed only when supplied by the backend.
     * The frontend never creates expires/signature parameters.
     */
    signedUrl:
      firstString(
        value.signed_url,
        value.signedUrl,
        value.temporary_url,
        value.temporaryUrl,
        links?.signed,
        links?.signed_url,
      ),

    raw:
      value,
  };
}

function extractList(
  response:
    unknown,
): unknown[] {
  if (
    Array.isArray(
      response,
    )
  ) {
    return response;
  }

  if (
    !isRecord(
      response,
    )
  ) {
    return [];
  }

  const candidates =
    [
      response.data,
      response.documents,
      response.vault,

      isRecord(
        response.data,
      )
        ? response.data.data
        : undefined,

      isRecord(
        response.data,
      )
        ? response.data.documents
        : undefined,
    ];

  for (
    const candidate of
    candidates
  ) {
    if (
      Array.isArray(
        candidate,
      )
    ) {
      return candidate;
    }
  }

  return [];
}

function extractRecord(
  response:
    unknown,
): Record<
  string,
  unknown
> | null {
  if (
    !isRecord(
      response,
    )
  ) {
    return null;
  }

  const candidates =
    [
      response.data,
      response.document,
      response.vault,
    ];

  for (
    const candidate of
    candidates
  ) {
    if (
      isRecord(
        candidate,
      )
    ) {
      return candidate;
    }
  }

  return response;
}

export async function getVaultDocuments(): Promise<
  VaultDocument[]
> {
  const response =
    await apiRequest<unknown>(
      "/api/vault",
      {
        method:
          "GET",
      },
    );

  return extractList(
    response,
  )
    .map(
      normalizeVaultDocument,
    )
    .filter(
      (
        document,
      ): document is VaultDocument =>
        document !==
        null,
    );
}

export async function getVaultDocument(
  id:
    string | number,
): Promise<VaultDocument> {
  const response =
    await apiRequest<unknown>(
      `/api/vault/${encodeURIComponent(
        String(
          id,
        ),
      )}`,
      {
        method:
          "GET",
      },
    );

  const document =
    normalizeVaultDocument(
      extractRecord(
        response,
      ),
    );

  if (
    !document
  ) {
    throw new Error(
      "The document details returned by the server could not be read.",
    );
  }

  return document;
}

export async function uploadVaultDocument(
  payload:
    UploadVaultDocumentPayload,
): Promise<unknown> {
  const formData =
    new FormData();

  formData.append(
    "file",
    payload.file,
  );

  if (
    payload.scholarshipId !==
      undefined &&
    payload.scholarshipId !==
      null &&
    String(
      payload.scholarshipId,
    ).trim()
  ) {
    formData.append(
      "scholarship_id",
      String(
        payload.scholarshipId,
      ),
    );
  }

  if (
    payload.universityId !==
      undefined &&
    payload.universityId !==
      null &&
    String(
      payload.universityId,
    ).trim()
  ) {
    formData.append(
      "university_id",
      String(
        payload.universityId,
      ),
    );
  }

  /*
   * Do not manually set multipart/form-data.
   * apiRequest() already lets the browser create the FormData boundary.
   */
  return apiRequest<unknown>(
    "/api/vault",
    {
      method:
        "POST",

      body:
        formData,
    },
  );
}

export async function deleteVaultDocument(
  id:
    string | number,
): Promise<void> {
  await apiRequest<unknown>(
    `/api/vault/${encodeURIComponent(
      String(
        id,
      ),
    )}`,
    {
      method:
        "DELETE",
    },
  );
}

/**
 * Returns only a URL already provided by the backend.
 *
 * If the list payload does not contain one, the existing
 * GET /api/vault/{id} detail endpoint is checked.
 *
 * No signed download URL is guessed or constructed here.
 */
export async function getVaultDocumentAccessUrl(
  document:
    VaultDocument,

  mode:
    | "preview"
    | "download",
): Promise<string> {
  const direct =
    mode ===
      "preview"
      ? document.previewUrl ??
        document.signedUrl ??
        document.downloadUrl
      : document.downloadUrl ??
        document.signedUrl ??
        document.previewUrl;

  if (
    direct
  ) {
    return direct;
  }

  const detail =
    await getVaultDocument(
      document.id,
    );

  const detailed =
    mode ===
      "preview"
      ? detail.previewUrl ??
        detail.signedUrl ??
        detail.downloadUrl
      : detail.downloadUrl ??
        detail.signedUrl ??
        detail.previewUrl;

  if (
    !detailed
  ) {
    throw new Error(
      "The backend did not provide a signed document URL.",
    );
  }

  return detailed;
}