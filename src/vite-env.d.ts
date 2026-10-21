interface ImportMetaEnv {
  readonly VITE_API_SERVER_HOST?: string;
  readonly VITE_API_SERVER_PORT?: string;
  readonly VITE_API_PROTOCOL?: string;
  readonly VITE_KAKAO_REST_API_KEY?: string;
  readonly VITE_MAP_TILE_URL?: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
