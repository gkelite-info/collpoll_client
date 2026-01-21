import { v4 as uuidv4 } from "uuid";
import { UiNamedItem, DbNamedItem } from "@/lib/helpers/calendar/types";

export const adminNormalizeWithUUID = (
  items: UiNamedItem[] = []
): DbNamedItem[] => {
  return items.map(item => ({
    uuid: item.uuid ?? uuidv4(),
    name: item.name,
  }));
};
 
export type NamedItem =
    | string
    | {
        uuid?: string;
        name?: string;
    };
 
export const normalizeWithUUID = (items: NamedItem[] = []) => {
    if (!Array.isArray(items)) return [];
 
    return items
        .map(item => {
            if (typeof item === "string") {
                return {
                    uuid: uuidv4(),
                    name: item
                };
            }
 
            if (typeof item === "object" && item.name) {
                return {
                    uuid: item.uuid ?? uuidv4(),
                    name: item.name
                };
            }
 
            return null;
        })
        .filter(Boolean);
};
 
 
export const normalizeUUID = (
    items: UiNamedItem[] = []
): DbNamedItem[] => {
    return items.map(item => ({
        uuid: item.uuid ?? uuidv4(),
        name: item.name,
    }));
};
