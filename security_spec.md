# Security Specification — CELL PHONE - Zoughaib Telecom

## 1. Data Invariants
1. **Public Storefront Catalog**: `products`, `repairs`, and `settings` are publicly readable by all visitors so shoppers can browse phones, accessories, repair services, and shop hours without signing in.
2. **Strict Admin-Only Writes**: All `create`, `update`, and `delete` operations on `products`, `repairs`, and `settings` require `request.auth != null && request.auth.token.email == "admin@zoughaibtelecom.app"`.
3. **Path Variable Hardening**: Every single-document `get`, `create`, `update`, and `delete` enforces `isValidId(id)` (`^[a-zA-Z0-9_\-]+$`, max 128 chars).
4. **Schema & Bounds Enforcement**: Every write passes `isValidProduct`, `isValidRepair`, or `isValidShopSettings` with strict `keys().hasAll(...)`, `keys().hasOnly(...)`, type checks, numeric bounds, string length bounds, and bounded list sizes (`<= 10` or `<= 12`).
5. **Default-Deny Catch-All**: All other paths in Firestore match `{document=**}` and deny all reads and writes.

## 2. The "Dirty Dozen" Adversarial Payloads
1. Unauthenticated product creation (`request.auth == null`) -> `PERMISSION_DENIED`.
2. Non-admin authenticated user (`email: "attacker@gmail.com"`) creating a product -> `PERMISSION_DENIED`.
3. Admin shadow field injection (`extraField: true`) on `products` create -> `PERMISSION_DENIED`.
4. Negative price (`price: -50`) on `products` create -> `PERMISSION_DENIED`.
5. Invalid brand (`brand: "FakeBrand"`) on `products` create -> `PERMISSION_DENIED`.
6. Invalid condition (`condition: "Refurbished"`) on `products` create -> `PERMISSION_DENIED`.
7. Oversized product name (`name` > 140 chars) -> `PERMISSION_DENIED`.
8. Unbounded array attack (`images` with 15 entries, max 10) -> `PERMISSION_DENIED`.
9. Path poisoning (`productId: "bad/../../id"` or > 128 chars) -> `PERMISSION_DENIED`.
10. Unauthenticated update to `settings/shop` (`whatsappNumber: "000"`) -> `PERMISSION_DENIED`.
11. Unauthenticated delete on `repairs/{repairId}` -> `PERMISSION_DENIED`.
12. Write to an unlisted collection `/secrets/keys` even by admin -> `PERMISSION_DENIED`.
