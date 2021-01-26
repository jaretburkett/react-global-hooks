

export const objCopy = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
}