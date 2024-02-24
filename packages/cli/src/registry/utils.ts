import { legalRegistryList } from "./constants.js"
export function filterLegalRegistry(list: string[]) {
  return list.filter(v => legalRegistryList.includes(v))
}
