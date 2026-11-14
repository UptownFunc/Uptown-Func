// Vite/Vitest `?raw` imports return the file's text (used by tests to compare shared codes across languages).
declare module "*?raw" {
  const text: string;
  export default text;
}

// Vite handles CSS side-effect imports.
declare module "*.css";
