// ==============================================================================
// CareSaathi AI - Deno Ambient Declarations for Supabase Edge Functions
// Enables TypeScript language servers / IDEs to recognize Deno APIs and URL imports
// ==============================================================================

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): Record<string, string>;
  }
  export const env: Env;
  export const version: {
    deno: string;
    v8: string;
    typescript: string;
  };
  export const args: string[];
}

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export interface ConnInfo {
    readonly localAddr: any;
    readonly remoteAddr: any;
  }
  export type Handler = (
    request: Request,
    connInfo?: ConnInfo
  ) => Response | Promise<Response>;

  export interface ServeInit {
    port?: number;
    hostname?: string;
    signal?: AbortSignal;
    onError?: (error: unknown) => Response | Promise<Response>;
    onListen?: (params: { hostname: string; port: number }) => void;
  }

  export function serve(
    handler: Handler,
    init?: ServeInit
  ): Promise<void>;
}

declare module "https://*" {
  const content: any;
  export default content;
  export const serve: any;
}
