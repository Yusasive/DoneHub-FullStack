 DoneHub – Modernized User Onboarding & Access Flow (MERN)
🔹 1. Problem with Old Flow (Invitation Codes)
- System Admin creating invite codes is outdated and clunky.
- Codes can be leaked, misused, or forgotten.
- It creates friction for onboarding, especially for non-technical users.
- Not scalable if hundreds of orgs need to be onboarded.
🔹 2. Proposed Modern Model
Core Principles:
- Self-Service Signup: Users decide their intended role (Org Admin / Org Member).
- System Admin Approval: All new orgs require manual approval by System Admin before going live.
- Invite-Only Members: Members cannot sign up freely; they must be invited by their Org Admin.
- Smooth UX: Use email links, status pages, and real-time notifications instead of codes.
Flow Overview:
1. Org Admin Candidate Signup → Pending Approval
2. System Admin Reviews Request → Approve / Reject
3. Org Admin Onboarding → Setup org name, branding, categories
4. Org Admin Invites Members via invite links/emails
5. Members Join Org via secure invite link
🔹 3. Detailed Workflows
A. Organization Admin Signup
1. User clicks “Sign up as Organization Admin”.
2. Fills: Name, Email, Org Name, Role.
3. System stores record in MongoDB with status = pending.
4. Confirmation email: “Your request is under review.”
5. System Admin dashboard shows pending requests.
6. If approved → email notification with welcome + login link.
7. If rejected → polite rejection email with reason.
 B. System Admin Approval
- Dashboard shows pending Org Admin requests.
- Actions: Approve | Reject | Request more info.
- Approval triggers creation of org record and admin assignment.
C. Organization Member Signup
1. Org Admin invites users via email or shareable link.
2. Member clicks invite link → redirected to signup.
3. Member signs up → auto-assigned org_id + role = member.
4. Member sees org dashboard after verification.
 D. Future-Proof Roles
- system_admin → full platform control
- org_admin → controls single organization
- sub_admin (optional) → department-level manager
- member → standard user
- guest (future) → temporary access
🔹 4. System Design (MERN Implementation)
MongoDB Collections:
- users: {_id, name, email, role, org_id, status}
- organizations: {_id, name, branding, created_by, status}
- invites: {_id, org_id, email, token, expires_at, status}
- tasks: {_id, org_id, assigned_to, ...}

Express.js APIs:
- POST /auth/signup-admin → create pending admin request
- POST /auth/signup-member → accept invite link
- GET /admin/requests → system admin fetch pending approvals
- POST /admin/approve/:id → approve org admin
- POST /org/invite → send invite link to member

Authentication:
- JWT for sessions (short-lived + refresh token).
- Email verification via tokenized links.
- Role middleware for protected APIs.
🔹 5. Modern UX/UI Recommendations
For Admin Signup Flow:
- Step-based Signup Wizard.
- Approval Status Page with live updates.
- Email + In-App Notifications.

For Org Member Flow:
- Magic Link Invites.
- Progressive Onboarding with checklist.

For System Admin Dashboard:
- Clean Approval Panel with one-click actions.
- Auto-generated org dashboards after approval.
🔹 6. Security Considerations
- Invite links should be time-bound (e.g., 7 days).
- Store invites as hashed tokens in DB.
- Rate limiting for login/invite endpoints.
- Audit logs for all admin actions.

