/** What the client needs to render the ads (see AdsProvider). Resolved on the server on every request. */
export interface AdsConfig {
  /** Whether this player sees ads: ADS_ENABLED on and not exempted (users.adsDisabled). */
  showAds: boolean
  /** AdSense publisher id ('ca-pub-…'). Null: not configured (a placeholder is shown outside production). */
  client: string | null
  /** AdSense ad unit id used by every AdSlot. */
  slot: string | null
}
