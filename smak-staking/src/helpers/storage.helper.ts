export const getLocalStorageData = (key: string, defaultValue: any): any => {
  try {
    return JSON.parse(localStorage.getItem(key) as any) || defaultValue
  } catch (error) {
    return defaultValue || null
  }
}
