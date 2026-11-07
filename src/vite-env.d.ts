/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_API_ENDPOINT?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
