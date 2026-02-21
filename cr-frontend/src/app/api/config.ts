/**
 * !TODO: Better to be gloabally configured to prevent code duplication
 * 
 */
const baseUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5001";
const crPath = "/cr";

export const apiConfig = {
  baseUrl,
  cr: {
    base: `${baseUrl}${crPath}`,
    incidents: `${baseUrl}${crPath}/incidents`,
  },
} as const;
