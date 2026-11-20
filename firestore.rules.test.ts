/**
 * Security Rules Verification Suite (Dirty Dozen Adversarial Payloads)
 * Covers all 12 penetration-test assertions defined in security_spec.md.
 */

export const DIRTY_DOZEN_CASES = [
  { id: 1, name: 'Unauthenticated product create', collection: 'products/prod_1', auth: null, op: 'create', expect: 'PERMISSION_DENIED' },
  { id: 2, name: 'Non-admin authenticated create', collection: 'products/prod_1', auth: { email: 'attacker@gmail.com' }, op: 'create', expect: 'PERMISSION_DENIED' },
  { id: 3, name: 'Shadow field injection on product', collection: 'products/prod_1', auth: { email: 'admin@zoughaibtelecom.app' }, op: 'create', payload: { extraField: true }, expect: 'PERMISSION_DENIED' },
  { id: 4, name: 'Negative price on product', collection: 'products/prod_1', auth: { email: 'admin@zoughaibtelecom.app' }, op: 'create', payload: { price: -50 }, expect: 'PERMISSION_DENIED' },
  { id: 5, name: 'Invalid brand enum', collection: 'products/prod_1', auth: { email: 'admin@zoughaibtelecom.app' }, op: 'create', payload: { brand: 'FakeBrand' }, expect: 'PERMISSION_DENIED' },
  { id: 6, name: 'Invalid condition enum', collection: 'products/prod_1', auth: { email: 'admin@zoughaibtelecom.app' }, op: 'create', payload: { condition: 'Refurbished' }, expect: 'PERMISSION_DENIED' },
  { id: 7, name: 'Oversized product name (>140 chars)', collection: 'products/prod_1', auth: { email: 'admin@zoughaibtelecom.app' }, op: 'create', payload: { name: 'A'.repeat(141) }, expect: 'PERMISSION_DENIED' },
  { id: 8, name: 'Unbounded images list (>10)', collection: 'products/prod_1', auth: { email: 'admin@zoughaibtelecom.app' }, op: 'create', payload: { images: Array(15).fill('img') }, expect: 'PERMISSION_DENIED' },
  { id: 9, name: 'Path poisoning ID', collection: 'products/' + 'x'.repeat(200), auth: { email: 'admin@zoughaibtelecom.app' }, op: 'create', expect: 'PERMISSION_DENIED' },
  { id: 10, name: 'Unauthenticated settings update', collection: 'settings/shop', auth: null, op: 'update', payload: { whatsappNumber: '000' }, expect: 'PERMISSION_DENIED' },
  { id: 11, name: 'Unauthenticated repair delete', collection: 'repairs/rep_1', auth: null, op: 'delete', expect: 'PERMISSION_DENIED' },
  { id: 12, name: 'Unlisted collection write by admin', collection: 'secrets/keys', auth: { email: 'admin@zoughaibtelecom.app' }, op: 'create', expect: 'PERMISSION_DENIED' }
];
