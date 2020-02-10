declare namespace NodeJS {
  export interface ProcessEnv {
    UMI_ENV: string;
    UMI_VERSION: string;
    NODE_ENV: 'production' | 'development' | 'test';
    HTTPS: string;
    HOST: string;
    PORT: string;
    APP_ROOT: string;
    CLEAR_OUTPUT: null | 'none';
    RM_TMPDIR: null | 'none';
    ERROR_CODE_MAP_PATH: string;
    SPEED_MEASURE: null | 'CONSOLE';
    BABEL_CACHE: null | 'none';
    COMPRESS: null | 'none';
    WATCH: null | 'none';
    SYSTEM_BELL: null | 'none';
  }
}
