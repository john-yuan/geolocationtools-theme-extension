import { withClassNamePrefix } from 'with-classname-prefix'

export function createClassPrefix(module: string) {
  return withClassNamePrefix('geolocationtools__' + module, '-')
}
