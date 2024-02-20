export function withValue<T = any>(
  value: T | null | undefined,
  callback: (value: T) => void
) {
  if (value != null) {
    callback(value)
  }
}
