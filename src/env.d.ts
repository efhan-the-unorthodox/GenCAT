interface ImportMetaEnv {
  readonly VITE_TRANSLATION_API_BASE_URL?: string;
  readonly VITE_TEXT_PREPROCESSING_ENDPOINT?: string;
  readonly VITE_TRANSLATION_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
