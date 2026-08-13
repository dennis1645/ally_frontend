# Mentor Action Plans Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign Mentor Action Plans page (`MentorActionPlansPage.tsx`) to allow mentors to select a mentee, view their current milestone context, select a `parent_milestone_id`, and construct dynamic multi-task action plan payloads (`action_plans` array) for milestone branching.

**Architecture:** Update `MentorActionPlansPage.tsx` state to fetch mentees via `getMentorMenteesApi`, allow selecting a mentee, display mentee readiness and target scholarship metrics, provide a parent milestone selector, and maintain a dynamic array of task items. When submitted, invoke `createActionPlanApi` with the combined payload containing `parent_milestone_id` and the array of `action_plans`.

**Tech Stack:** React (TypeScript), Tailwind CSS, Lucide React icons, Vite.

## Global Constraints

- Preserve all existing submission audit/review features in `MentorActionPlansPage.tsx`.
- Payload format sent to API must strictly match:
  `{ parent_milestone_id: number, action_plans: Array<{ task_title, task_description, mentor_note, deadline }> }`.
- Follow existing project visual styling (vanilla Tailwind with ally primary colors).

---

### Task 1: Update API Types & Payload Handling in `mentorApi.ts`

**Files:**
- Modify: `src/api/mentorApi.ts:116-127`

**Interfaces:**
- Consumes: `apiRequest` from `./apiClient`
- Produces: `CreateActionPlanPayload`, `createActionPlanApi`

- [ ] **Step 1: Check existing `CreateActionPlanPayload` definition**

Verify lines 116-127 in `src/api/mentorApi.ts`:
```typescript
export type ActionPlanItemInput = {
  task_title: string;
  task_description: string;
  mentor_note?: string;
  deadline: string;
};

export type CreateActionPlanPayload = {
  parent_milestone_id?: number;
  action_plans: ActionPlanItemInput[];
};
```

- [ ] **Step 2: Ensure `createActionPlanApi` handles flexible identifier or payload**

Ensure `createActionPlanApi` function signature in `src/api/mentorApi.ts` is:
```typescript
export async function createActionPlanApi(
  bookingIdOrMenteeId: number | string,
  payload: CreateActionPlanPayload
): Promise<ApiResponse<{ action_plans: unknown[]; user_milestones: unknown[] }>> {
  return await apiRequest<ApiResponse<{ action_plans: unknown[]; user_milestones: unknown[] }>>(
    `/api/mentor/bookings/${bookingIdOrMenteeId}/action-plans`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}
```

- [ ] **Step 3: Test build / TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/api/mentorApi.ts
git commit -m "refactor(api): ensure flexible action plan creation payload types"
```

---

### Task 2: Redesign Action Plan UI Component in `MentorActionPlansPage.tsx`

**Files:**
- Modify: `src/pages/mentor/MentorActionPlansPage.tsx`

**Interfaces:**
- Consumes: `getMentorMenteesApi`, `MenteeItem`, `createActionPlanApi` from `../../api/mentorApi`
- Produces: Complete Mentor Action Plan & Audit Page UI

- [ ] **Step 1: Update imports and state for mentee & dynamic action plan items**

In `src/pages/mentor/MentorActionPlansPage.tsx`:
Add imports: `getMentorMenteesApi`, `MenteeItem`, `Trash2`, `UserCheck`, `Compass`.
Add state variables:
- `mentees: MenteeItem[]`
- `selectedMenteeId: string`
- `parentMilestoneId: number` (default e.g. `3`)
- `actionPlanTasks: ActionPlanItemInput[]` (initial array with 1 item)

- [ ] **Step 2: Add `fetchMentees` on mount to load available mentees**

Load mentees list using `getMentorMenteesApi()` on `useEffect`. Auto-select first mentee if available.

- [ ] **Step 3: Build Mentee & Milestone Context Selector UI**

Build UI card with:
- Dropdown select for Mentee.
- Mentee Info Badge: Readiness Score %, Target Scholarship, Target Country.
- Select/Input for `Parent Milestone Target` (`parent_milestone_id`).

- [ ] **Step 4: Build Dynamic Multi-Task Action Plan Form**

Render list of tasks from `actionPlanTasks`.
For each task item:
- `task_title` (input text)
- `task_description` (textarea)
- `mentor_note` (input text)
- `deadline` (input date)
- Remove Task button (if `actionPlanTasks.length > 1`)

Add "+ Tambah Tugas Lain" button at bottom of list to append a blank task item:
`{ task_title: "", task_description: "", mentor_note: "", deadline: "" }`.

- [ ] **Step 5: Connect submit handler to send multi-task payload**

On form submit:
- Validate all tasks have `task_title` and `deadline`.
- Call `createActionPlanApi(selectedMenteeId || "1", { parent_milestone_id: parentMilestoneId, action_plans: actionPlanTasks })`.
- On success: show success notification message and reset tasks to initial empty template.

- [ ] **Step 6: Run TypeScript build & check component rendering**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
git add src/pages/mentor/MentorActionPlansPage.tsx
git commit -m "feat(mentor): implement mentee milestone branching and multi-task action plan UI"
```
