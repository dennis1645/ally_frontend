import type {
  LucideIcon,
} from "lucide-react";

export type DocumentValleyDocumentStatus =
  | "complete"
  | "missing"
  | "pending";

export type DocumentValleyChecklistItem = {
  id:
    number;

  title:
    string;

  status:
    DocumentValleyDocumentStatus;

  statusText:
    string;

  actionLabel?:
    string;

  icon:
    LucideIcon;
};

export type BackpackFile = {
  id:
    number;

  name:
    string;

  size:
    string;
};

export type BackpackSectionStatus =
  | "done"
  | "in-progress";

export type BackpackSection = {
  id:
    string;

  title:
    string;

  status:
    BackpackSectionStatus;

  icon:
    LucideIcon;

  files:
    BackpackFile[];
};

export type TrailReminderTone =
  | "danger"
  | "warm";

export type TrailReminder = {
  id:
    number;

  title:
    string;

  description:
    string;

  tone:
    TrailReminderTone;
};

export type DocumentBadge = {
  id:
    number;

  label:
    string;

  unlocked:
    boolean;

  icon:
    LucideIcon;

  tone:
    "gold"
    | "blue"
    | "locked";
};