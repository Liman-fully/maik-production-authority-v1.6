# Huntlink API Mapping & Module Correspondence

## Overview
This document maps frontend pages and features to their respective backend modules and endpoints.

## 1. Core Pages

| Frontend Page | Path | Backend Module | Primary Endpoints |
| :--- | :--- | :--- | :--- |
| **Home / Talent Square** | `/` | `JobModule`, `TalentModule` | `GET /jobs/recommendations`, `GET /talents/featured` |
| **Talent Search** | `/search` | `TalentModule` | `GET /talents/search`, `GET /talents/filters` |
| **Resume Library** | `/resumes` | `ResumeModule` | `GET /resumes`, `POST /resumes/upload` |
| **Login / Register** | `/login`, `/register` | `AuthModule` | `POST /auth/login`, `POST /auth/register`, `POST /auth/send-sms` |
| **Profile Management** | `/profile` | `UserModule` | `GET /user/me`, `PATCH /user/update` |

## 2. Feature Specific Mapping

### Smart Recommendation Engine
- **Frontend:** `/` (Home Component)
- **Backend:** `JobService.getRecommendations()`
- **Logic:** Uses user's `currentTitle` and `skills` to match with active `Job` postings.

### Talent Filtering & Search
- **Frontend:** `/search` (FilterBar + TalentList)
- **Backend:** `TalentService.search(query: SearchDto)`
- **Logic:** Full-text search on names/titles and exact match on salary ranges/experience levels.

### Authentication & Verification
- **Frontend:** Auth Forms
- **Backend:** `AuthService`
- **Logic:** Redis-backed SMS code verification. 5-minute TTL.

## 3. Data Field Mappings (Frontend Adapter)

| Backend Field | Frontend UI Label | Component |
| :--- | :--- | :--- |
| `currentTitle` | `title` | `TalentCard` |
| `expectedSalary` | `salary` | `TalentCard` |
| `idCard` | (Internal/Verification Only) | `RegisterForm` |
| `isActive` | (Hidden/Status Indicator) | `AdminPanel` |
