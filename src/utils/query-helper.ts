export function safeNumber(value: any): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

export function safeString(value: any): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const str = String(value).trim();
  return str === '' ? undefined : str;
}

export function safeDate(value: any): Date | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const date = new Date(value);
  return isNaN(date.getTime()) ? undefined : date;
}

export function validateEnum<T extends Record<string, string>>(
  value: any,
  enumObject: T
): T[keyof T] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const enumValues = Object.values(enumObject);
  return enumValues.includes(value) ? value : undefined;
}

export function safeBool(value: any): boolean | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return undefined;
}

export function safeArray(value: any): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value.map(v => String(v)).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(',').map(v => v.trim()).filter(Boolean);
  }
  return undefined;
}

