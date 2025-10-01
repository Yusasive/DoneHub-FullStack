# Product Requirements Document (PRD)

**Project:** DoneHub – Modernized User Onboarding & Access Flow
**Stack:** React (Vite) frontend with in-memory mock data (future backend: MongoDB & Express)
**Brand Identity:** Green (#008000) & White (#FFFFFF)

---

## 1. Objective

Modernize DoneHub’s user onboarding and organizational access flow by replacing outdated **invitation code** workflows with a **secure, scalable, and user-friendly approval + invite system**.

The goal is to:

* Reduce friction for new organizations.
* Maintain security via admin approvals and controlled invites.
* Provide a modern UX aligned with DoneHub’s green-and-white brand identity.
* Enable scalability for hundreds of organizations.

---

## 2. User Roles

* **System Admin** → Full platform control, approves new orgs.
* **Org Admin** → Controls one organization, invites members.
* **Sub Admin** (Future) → Department-level manager.
* **Member** → Standard org member.
* **Guest** (Future) → Temporary access.

---

## 3. Key Features

### 3.1 Org Admin Signup Flow

1. User clicks **“Sign up as Organization Admin”**.
2. Completes form: Name, Email, Org Name, Role.
3. Request stored in DB as **pending**.
4. Confirmation email sent (“Your request is under review”).
5. System Admin reviews request → Approve / Reject / Request Info.
6. If approved:

   * Org is created in DB.
   * Welcome email with login link.
   * Redirect to onboarding wizard (org name, branding, categories).
7. If rejected: Polite rejection email with reason.

### 3.2 Org Member Signup Flow

1. Org Admin invites members via **email or shareable invite link**.
2. Member clicks invite link → directed to signup.
3. Signup assigns them to org with role = **member**.
4. Post-verification, member lands on org dashboard.

### 3.3 System Admin Dashboard

* View pending org admin requests.
* Approve / Reject / Request Info.
* Auto-generate org dashboards upon approval.
* View activity logs.

### 3.4 UX Enhancements

* **Green + White theme** for all flows.
* Step-based Signup Wizard.
* Approval Status Page with live updates.
* Magic Link Invites for members.
* Progressive Onboarding Checklist for org setup.
* Email + In-app Notifications.

---

## 4. Technical Design

### 4.1 Data Models (MongoDB)

* **users:** {_id, name, email, role, org_id, status}
* **organizations:** {_id, name, branding, created_by, status}
* **invites:** {_id, org_id, email, token, expires_at, status}
* **tasks:** {_id, org_id, assigned_to, ...}

### 4.2 APIs (Express.js)

* `POST /auth/signup-admin` → create pending admin request
* `POST /auth/signup-member` → accept invite link
* `GET /admin/requests` → fetch pending approvals
* `POST /admin/approve/:id` → approve org admin
* `POST /org/invite` → send invite link to member

### 4.3 Authentication & Security

* **JWT** sessions (short-lived + refresh token).
* **Email verification** via tokenized links.
* **Role-based middleware** for protected APIs.
* **Invite links**: time-bound (7 days) + hashed in DB.
* **Rate limiting** for login & invite endpoints.
* **Audit logs** for all admin actions.

---

## 5. Success Metrics

* ✅ Reduce onboarding time for new orgs by >50%.
* ✅ Zero reported cases of leaked/misused invite codes.
* ✅ System admin can handle >100 org approvals weekly without bottlenecks.
* ✅ Positive UX feedback from >80% of onboarded users.

---

## 6. Future Enhancements

* Sub-admin role for departments.
* Guest accounts with expiry.
* Org-level branding (custom logos, themes).
* Real-time notifications (WebSockets).
* SSO integration (Google, Microsoft).

---

## 7. Visual & Branding Guidelines

* **Primary Colors**: Green (#008000) & White (#FFFFFF).
* **Typography**: Clean, modern sans-serif (e.g., Inter / Roboto).
* **UI Style**: Minimalist, step-by-step guidance, clear call-to-actions in green buttons.
* **Admin Dashboard**: Green accents, white backgrounds, status indicators (green = approved, red = rejected, yellow = pending).

---
