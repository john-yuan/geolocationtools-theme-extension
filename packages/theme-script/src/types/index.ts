export interface Config {
  assetUrl?: string // https://example.com/assets/1.0.0/[name]?v=20240101
  shopId?: string
  storageKey?: string
}

export interface RedirectBaseSettings {
  title?: string
  text?: string
  ok_text?: string
  close_text?: string
  search_hint?: string
  empty_hint?: string
  filterable?: number
  names?: Record<string, string>
  close_as_confirm?: boolean
}

export interface RedirectSiteSettings extends RedirectBaseSettings {
  homepage?: string
  codes?: string[]
  with_uri?: boolean
}

export interface RedirectSettings extends RedirectBaseSettings {
  sites?: RedirectSiteSettings[]
  center?: boolean
  color?: 'auto' | 'dark' | 'light'
  storage_ttl?: number // ms
  storage_version?: string
}

export interface StatInfo {
  locked?: boolean
  lock_error_title?: string
  lock_error_text?: string
  lock_login_path?: string
  // error_page(1), error_page_with_form(2), blank_page(3)
  lock_strategy?: number
  code?: string
  redirect_settings?: RedirectSettings
}
