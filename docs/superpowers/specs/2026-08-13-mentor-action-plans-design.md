# Design Spec: Mentor Action Plans & Mentee Milestone Branching

**Date:** 2026-08-13  
**Status:** Proposed  
**Target File:** `src/pages/mentor/MentorActionPlansPage.tsx`, `src/api/mentorApi.ts`

---

## 1. Background & Goals
Saat ini form pembuatan Action Plan pada dashboard mentor masih meminta input manual `bookingId` sederhana dan hanya bisa mengirim 1 tugas sekaligus. 

Sesuai kebutuhan baru:
1. Mentor harus dapat memilih **Mentee** aktif dari daftar mentee bimbingan.
2. Tampilan menunjukkan **milestone & progress mentee** saat ini (posisi/tahap pembahasannya).
3. Mentor memilih **`parent_milestone_id`** yang menjadi induk/cabang dari Action Plan tersebut.
4. Mentor dapat menambahkan **banyak tugas sekaligus** (`action_plans` array: `task_title`, `task_description`, `mentor_note`, `deadline`).
5. Pada dashboard mentee, Action Plan ini akan dibuatkan **branch (sub-task)** di bawah `parent_milestone_id` terkait.

---

## 2. Dynamic UI Architecture (`MentorActionPlansPage.tsx`)

### A. Mentee Selection & Progress Overview
- Dropdown / Select Selector untuk mentee bimbingan (`getMentorMenteesApi`).
- Ketika Mentee dipilih:
  - Tampilkan ringkasan status Mentee: Target Beasiswa, Country Target, Readiness Score (%), dan Progress Task.
  - Tampilkan pilihan **Parent Milestone Target** (misal: `Milestone 1: Profiling`, `Milestone 2: Submisi Berkas`, `Milestone 3: Essay & Dokumen Beasiswa`, dll.) dengan ID-nya (`parent_milestone_id`).

### B. Dynamic Action Plan Form (Multi-Task)
- Mentor menentukan `parent_milestone_id`.
- Komponen daftar task interaktif:
  - Setiap task item terdiri dari:
    - **Judul Tugas (`task_title`)** - *Wajib*
    - **Deskripsi Tugas (`task_description`)**
    - **Catatan Mentor (`mentor_note`)**
    - **Deadline (`deadline`)** - *Wajib*
  - Tombol **"+ Tambah Tugas"** untuk menambah item `action_plan` baru ke array.
  - Tombol **Hapus (Trash icon)** untuk menghapus item jika terdapat lebih dari 1 item.

### C. Payload & Request JSON
Saat disubmit, payload yang dikirim ke backend mengikuti format:
```json
{
  "parent_milestone_id": 3,
  "action_plans": [
    {
      "task_title": "Revisi Paragraf Kontribusi Esai",
      "task_description": "Perjelas dampak nyata dari proyek kepemimpinan yang telah Anda pimpin.",
      "mentor_note": "Fokus pada kuantifikasi data seperti jumlah peserta dan dampak sosialnya.",
      "deadline": "2026-08-20"
    },
    {
      "task_title": "Minta 2 Surat Rekomendasi Resmi",
      "task_description": "Hubungi dosen pembimbing skripsi dan atasan kerja langsung.",
      "mentor_note": "Gunakan draf draf rekomendasi yang sudah disepakati saat sesi.",
      "deadline": "2026-08-25"
    }
  ]
}
```

---

## 3. Data Flow & State Management

1. `fetchMentees()` dipanggil saat halaman di-mount (`getMentorMenteesApi`).
2. State Mentee terpilih (`selectedMenteeId`) mengisi data konteks.
3. State `parentMilestoneId` diset oleh mentor (default = 3 atau sesuai milestone mentee).
4. State `actionPlanItems` berupa array of `ActionPlanItemInput`.
5. Form submit memanggil `createActionPlanApi(bookingOrMenteeId, payload)` dan menampilkan pesan sukses.
