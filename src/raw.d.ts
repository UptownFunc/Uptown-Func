// Vite/Vitest `?raw` imports return the file's text (used by tests to compare shared codes across languages).
declare module "*?raw" {
  const text: string;
  export default text;
}

// Vite handles CSS side-effect imports.
declare module "*.css";

// Vite's build-time constants used by the app (the full `vite/client` types are not loaded: tsconfig `types` is empty).
interface ImportMeta { readonly env: { readonly DEV: boolean; readonly BASE_URL: string } }
