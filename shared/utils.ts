export function toObject<T extends Object>(obj: T): T {
    const result: any = {};
  
    for (const [key, value] of Object.entries(obj)) {
        if (value instanceof Map) {
            // Convert Map to Object
            result[key] = Object.fromEntries(value);
        } else {
            // Copy the value as it is
            result[key] = value;
        }
    }
  
    return result as T;
  }
  
export function toMap(obj) {
    const result = {};

    for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            // If the value is an object and not an array, convert it to a Map
            result[key] = new Map(Object.entries(value));
        } else {
            // Otherwise, copy the value as it is
            result[key] = value;
        }
    }

    return result;
}
