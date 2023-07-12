export const logger = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
};

type CopyFn = (text: string) => Promise<boolean>; // Return success

export const copy: CopyFn = async (text) => {
  if (!navigator?.clipboard) {
    console.warn("Clipboard not supported");
    return false;
  }

  // Try to save to clipboard then save it in the state if worked
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.warn("Copy failed", error);

    return false;
  }
};

export const makeElipsisAddress = (address?: string, padding = 6): string => {
  if (!address) return "";
  return `${address.substring(0, padding)}...${address.substring(address.length - padding)}`;
};
