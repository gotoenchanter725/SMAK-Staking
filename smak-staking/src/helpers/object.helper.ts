export const isObject = (obj: any): boolean => {
  return typeof obj === 'object' && !Array.isArray(obj) && obj !== null
}

export const hasProperty = (obj: any, key: string): boolean => {
  return Object.prototype.hasOwnProperty.call(obj, key)
}
