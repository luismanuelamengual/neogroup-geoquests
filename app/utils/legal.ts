/**
 * Data of the legal pages (privacy policy, terms of use, account deletion; the
 * first and the last are linked from Google Play). `CONTACT_EMAIL` is where players can write to ask about their data.
 */
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'soporte@geoquests.app'

/** Date of the last change of the privacy policy, shown on the page. */
export const PRIVACY_POLICY_UPDATED_AT = new Date('2026-10-26T00:00:00Z')

/** Date of the last change of the terms of use, shown on the page. */
export const TERMS_UPDATED_AT = new Date('2026-10-26T00:00:00Z')
