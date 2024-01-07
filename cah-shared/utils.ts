// Define an interface for an object that might have the __isMap property
interface PossibleMap {
    [key: string]: any;
    __isMap?: boolean;
}
function isObject(item: any): item is Object {
    return item && typeof item === 'object' && !Array.isArray(item);
}

function convertMap(map: Map<any, any>): Object {
    const obj: PossibleMap = Object.fromEntries(map);
    obj.__isMap = true;
    return obj;
}

export function toObject<T>(obj: T): any {


    if (obj instanceof Map) {
        return convertMap(obj);
    } else if (!isObject(obj)) {
        return obj;
    }

    const result: any = {};

    for (const [key, value] of Object.entries(obj)) {
        if (value instanceof Map) {
            result[key] = convertMap(value);
        } else if (isObject(value)) {
            result[key] = toObject(value);
        } else {
            result[key] = value;
        }
    }

    return result;
}

export function toMap<T extends Object>(obj: T): T {
    if (!isObject(obj)) {
        return obj;
    }

    const result: any = {};

    for (const [key, value] of Object.entries(obj)) {
        const possibleMapValue = value as PossibleMap;

        if (isObject(possibleMapValue)) {
            if (possibleMapValue.__isMap) {
                const temp = { ...possibleMapValue };
                delete temp.__isMap;
                result[key] = new Map(Object.entries(temp));
            } else {
                result[key] = toMap(possibleMapValue);
            }
        } else {
            result[key] = value;
        }
    }

    return result as T;
}
