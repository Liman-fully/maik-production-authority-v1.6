# Huntlink Frontend Development Standards (2026)

## Overview
This document defines the modular development standards for the Huntlink recruitment social platform. The frontend is built with **Next.js 15+**, **Tailwind CSS 4.0**, and **TypeScript**.

## 1. Directory Structure
- `app/`: Routing and page components (Next.js App Router).
- `components/`: Reusable UI components.
    - `ui/`: Atomic components (Buttons, Inputs, Modals) based on shadcn/ui patterns.
    - `shared/`: Business-logic-specific shared components (e.g., `Navigation`, `Footer`).
    - `features/`: Complex feature-specific components (e.g., `TalentCard`, `JobFilter`).
- `services/`: API service layer using Axios.
- `lib/`: Utility functions and shared configurations (e.g., `api.ts`, `utils.ts`).
- `hooks/`: Custom React hooks.
- `store/`: State management (Zustand or React Context).
- `types/`: Global TypeScript definitions.

## 2. Component Standards
- **Functional Components:** Always use functional components with arrow functions.
- **TypeScript:** Every component must have a defined `interface` for its props.
- **Tailwind CSS:** Use Tailwind 4.0 utility classes. Avoid custom CSS files unless absolutely necessary.
- **Server vs Client:** 
    - Use Server Components by default for better SEO and performance.
    - Use `'use client'` only for components requiring interactivity (hooks, state, browser APIs).

## 3. Data Flow & API Integration
- **Service Pattern:** API calls must reside in `services/`. Do not use `fetch` or `axios` directly in components.
- **Adapters:** When backend field names differ from UI expectations, implement an adapter logic within the service layer or component.
- **Error Handling:** Use `try-catch` in client components or global interceptors in `lib/api.ts`.

## 4. Coding Style
- **Naming:** 
    - Components: PascalCase (e.g., `TalentCard.tsx`).
    - Files/Folders: kebab-case (e.g., `talent-service.ts`).
- **Formatting:** Prettier and ESLint are mandatory.

## 5. Maintenance & Versioning
- **Mock Data:** Prohibited in production. All components must be data-driven.
- **Design Drift Prevention:** Before creating a new component, check `components/ui` for existing primitives.
- **Documentation:** Major features must have a README in their respective directory.
