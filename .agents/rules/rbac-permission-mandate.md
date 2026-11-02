# Mandatory Rule: Project-Wide RBAC & Authorization Mandate for VieJap

All developers and AI Coding Agents working on this project MUST follow the 6-step Authorization Protocol whenever creating a new feature or modifying an existing one:

## 1. 6-Step Feature Development Protocol
1. **Identify Required Permissions:** Format `<module>.<action>` (e.g. `contracts.view`, `contracts.delete`).
2. **Register in Centralized Permission Registry:** Add to `admin_permission_registry()` in `public/api/admin/_rbac.php` and `src/app/features/admin/components/users-admin/users-admin.models.ts`. Include `key`, Vietnamese `name`, `description`, `module`, `moduleName`, `action`, `isSensitive`.
3. **Verify UI Appearance:** Permissions must dynamically appear in Roles Permission Matrix and User Overrides tabs.
4. **Enforce Backend & Frontend:**
   - Frontend: `AdminAuthService.hasPermission('...')` or `hasAnyPermission([...])`.
   - Backend: `admin_require_permission($session, '...')`.
   - Enforce Data Scope (`own`, `assigned`, `team`, `department`, `all`).
5. **Safe Defaults:** New permissions are granted exclusively to `super_admin` by default. No automatic mass grant to regular roles.
6. **Automated Verification:** Run `npm run check:rbac` (executes `php tests/audit_rbac_compliance.php`). Must pass with 0 errors.

## 2. Definition of Done (DoD)
No feature is considered complete without:
- Main feature code implemented.
- Permissions registered in `_rbac.php`.
- Frontend visibility controls in place.
- Backend API `admin_require_permission` enforced.
- Verification script `npm run check:rbac` passed.
- Final 5-point report provided.

