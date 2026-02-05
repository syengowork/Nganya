# Nganya Booking Platform - AI Agent Instructions

## Project Overview

**Nganya** is a Next.js 16 app for a ride-sharing/vehicle-sharing platform (SACCO management system for Kenya). It enables SACCOs (cooperative transport associations) to list vehicles and manage bookings, while users can discover and book available rides.

**Stack**: Next.js 16 (App Router) + TypeScript + React 19 + Supabase + Tailwind CSS 4 + shadcn/ui

---

## Architecture & Data Flow

### Core Layers

1. **Server Actions** (`src/actions/*.ts`)
   - Handle all server-side logic: auth (signup), vehicle creation, bookings
   - Use Zod for input validation before Supabase operations
   - Pattern: `'use server'` directive, FormData input, return `{status, message}` objects
   - Example: [auth.ts](src/actions/auth.ts#L1) validates registration then creates Supabase auth user + profile record

2. **UI Components** (`src/components/`)
   - **Client Components** (`'use client'`): Forms, dialogs, interactive elements
   - Use `react-hook-form` + `zodResolver` for client validation (e.g., [RegisterForm.tsx](src/components/auth/RegisterForm.tsx#L1))
   - Use `framer-motion` for animations (entrance/exit, stagger effects)
   - Leverage shadcn/ui building blocks from [src/components/ui/](src/components/ui/)
   - Pattern: Form validation → server action call → error/success state handling

3. **Supabase Integration** (`src/utils/supabase/server.ts`)
   - Server-side client created via [server.ts](src/utils/supabase/server.ts) using SSR pattern
   - Auth metadata stored in Supabase custom claims (e.g., full_name, phone_number)
   - Public profiles table mirrors auth users; linked by `user.id`
   - Environment vars required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Key Data Entities

- **Auth Users** (Supabase Auth) → custom metadata: full_name, phone_number
- **Profiles** (public.profiles table) → id (user id), full_name, phone_number, role (user/sacco)
- **Vehicles** (public.vehicles table) → created by SACCOs, includes cover/exterior/interior photos, features, rate_per_hour
- **Bookings** (inferred) → link users to vehicles with trip details

---

## Critical Workflows

### Development

```bash
npm run dev              # Start dev server on http://localhost:3000
npm run build            # Build for production
npm run lint             # Run ESLint (with --fix flag to auto-correct)
npm start                # Start production server
```

### Component & Form Development

- **Form Pattern**: Use `react-hook-form` with `zodResolver`; define schema separately (e.g., [step1Schema in VehicleWizard.tsx](src/components/dashboard/sacco/VehicleWizard.tsx#L39))
- **File Uploads**: Use `react-dropzone` for image inputs; compress before sending via `browser-image-compression`
- **Multi-Step Wizards**: Merge Zod schemas for combined validation (e.g., step1Schema.merge(step2Schema))
- **Server Actions**: Always use FormData to bridge client→server safely

### Authentication Flow

1. User submits registration form → client validates with Zod
2. Form→server action: `signupAction(prevState, formData)`
3. Server validates again with `registerSchema.safeParse()`
4. Supabase auth.signUp() creates user + metadata
5. Explicit profile insert in profiles table
6. Return `{status: 'success'|'error', message}`
7. Client handles response, shows success state or error

---

## Project-Specific Conventions

### File & Folder Organization

- `src/actions/` – Server actions grouped by domain (auth.ts, vehicle.ts)
- `src/components/auth/`, `src/components/dashboard/` – Component folders by feature
- `src/components/ui/` – Reusable shadcn/ui primitives
- `src/lib/` – Utilities (e.g., cn() for Tailwind merging)
- `src/utils/supabase/` – Supabase client initialization and helpers
- `src/config/` – Constant configs like navigation (nav.ts)
- `src/types/` – TypeScript interfaces/types (e.g., Supabase auto-generated types)

### Naming & Conventions

- **Components**: PascalCase (e.g., `RegisterForm`, `VehicleWizard`)
- **Server Actions**: camelCase ending in "Action" (e.g., `signupAction`, `createVehicleAction`)
- **Zod Schemas**: camelCase ending in "Schema" (e.g., `registerSchema`, `step1Schema`)
- **Imports**: Use `@/` path alias for src/ imports (configured in tsconfig.json)

### Styling

- **Tailwind CSS 4** with `@tailwindcss/postcss`
- **Class Merging**: Use `cn()` from `@/lib/utils` to merge Tailwind classes safely
- **Dark Mode**: Supported via `next-themes`
- **Form Inputs**: Always wrap with `<Label>` + `<Input>` using shadcn patterns

### Validation

- **Server-side**: Always re-validate with Zod in server actions (never trust client)
- **Client-side**: Use Zod + `@hookform/resolvers` for real-time UX feedback
- **Kenyan Phone**: Regex `/^(?:\+254|0)[17]\d{8}$/` – starts with +254 or 0, followed by 1 or 7, then 8 digits
- **Vehicle Plate**: Regex `/^[A-Z]{3} \d{3}[A-Z]$/` – Format: KBC 123A (3 letters, space, 3 digits, 1 letter)

### Animations

- Use `framer-motion` for entrance/exit and micro-interactions
- Define `Variants` objects separately for reusability
- Pattern: `containerVariants` with staggerChildren + `itemVariants` for list effects
- Example: [VehicleWizard animations](src/components/dashboard/sacco/VehicleWizard.tsx#L20)

---

## Integration Points & External Dependencies

| Dependency | Purpose | Key Files |
|---|---|---|
| **@supabase/supabase-js** | Database & auth backend | [server.ts](src/utils/supabase/server.ts) |
| **@supabase/ssr** | Server-side Supabase SSR client | [server.ts](src/utils/supabase/server.ts) |
| **react-hook-form** | Form state management | [RegisterForm.tsx](src/components/auth/RegisterForm.tsx#L2) |
| **zod** | Schema validation (server + client) | All forms & actions |
| **framer-motion** | Animations & transitions | [RegisterForm.tsx](src/components/auth/RegisterForm.tsx#L15), [VehicleWizard.tsx](src/components/dashboard/sacco/VehicleWizard.tsx#L20) |
| **react-dropzone** | File upload handling | [VehicleWizard.tsx](src/components/dashboard/sacco/VehicleWizard.tsx#L18) |
| **@google-cloud/vision** | Image recognition (OCR/document scanning) | [Not yet visible in provided files] |
| **browser-image-compression** | Client-side image optimization | [VehicleWizard.tsx](src/components/dashboard/sacco/VehicleWizard.tsx) (inferred) |

### Supabase Schema Assumptions

- `public.auth.users` – Supabase managed; custom claims: full_name, phone_number
- `public.profiles` – id (PK, FK to auth.users), full_name, phone_number, role
- `public.vehicles` – Likely: id, sacco_id, name, plate_number, capacity, rate_per_hour, features, description, cover_photo, exterior_photos, interior_photos, created_at
- `public.bookings` – Inferred: id, user_id, vehicle_id, booking_date, trip_details, status

---

## Common Pitfalls & Solutions

| Issue | Prevention |
|---|---|
| **Client imports from server-only modules** | Server actions stay in `src/actions/`, Supabase client in `src/utils/supabase/server.ts` is only imported by actions or server components |
| **Forgetting 'use client' in interactive forms** | Always add `'use client'` at top of components using hooks, form state, or event handlers |
| **Validation skipped on server** | Re-validate every FormData input in server actions with Zod before DB operations |
| **Styling inconsistencies** | Use `cn()` to merge Tailwind safely; check shadcn/ui component exports for API consistency |
| **Type safety for Supabase tables** | Use auto-generated types from `src/types/supabase.ts` when querying |
| **Missing FormData serialization** | In client, iterate FormData with `Object.entries(data).forEach(([key, value]) => formData.append(key, value))` before sending to action |

---

## Rapid Onboarding Checklist

- [ ] Clone repo, install dependencies: `npm install`
- [ ] Set up `.env.local` with Supabase URL & anon key
- [ ] Run `npm run dev` and verify auth flows work
- [ ] Review `schema.sql` to understand table structure
- [ ] Read [RegisterForm.tsx](src/components/auth/RegisterForm.tsx) and [auth.ts](src/actions/auth.ts) as full client→server flow examples
- [ ] Check [VehicleWizard.tsx](src/components/dashboard/sacco/VehicleWizard.tsx) for multi-step form + file upload patterns
- [ ] Review [nav.ts](src/config/nav.ts) for dashboard routing structure

