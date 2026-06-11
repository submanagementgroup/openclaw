// ACP Core type module defines shared TypeScript contracts.
import { normalizeOptionalLowercaseString } from "@openclaw/normalization-core/string-coerce";

const ACP_PROVENANCE_MODE_VALUES = ["off", "meta", "meta+receipt"] as const;

export type SessionId = string;

export type AcpProvenanceMode = (typeof ACP_PROVENANCE_MODE_VALUES)[number];

export function normalizeAcpProvenanceMode(
  value: string | undefined,
): AcpProvenanceMode | undefined {
  const normalized = normalizeOptionalLowercaseString(value);
  if (!normalized) {
    return undefined;
  }
  return (ACP_PROVENANCE_MODE_VALUES as readonly string[]).includes(normalized)
    ? (normalized as AcpProvenanceMode)
    : undefined;
}

export type AcpSession = {
  sessionId: SessionId;
  sessionKey: string;
  ledgerSessionId?: string;
  cwd: string;
  createdAt: number;
  lastTouchedAt: number;
  abortController: AbortController | null;
  activeRunId: string | null;
};

export type AcpServerOptions = {
  gatewayUrl?: string;
  gatewayToken?: string;
  gatewayPassword?: string;
  defaultSessionKey?: string;
  defaultSessionLabel?: string;
  requireExistingSession?: boolean;
  resetSession?: boolean;
  prefixCwd?: boolean;
  provenanceMode?: AcpProvenanceMode;
  sessionCreateRateLimit?: {
    maxRequests?: number;
    windowMs?: number;
  };
  verbose?: boolean;
  /**
   * Run as a backend-to-backend ACP bridge instead of a personal IDE/CLI
   * client. When set:
   *   - the connect frame carries no `device` field (no per-process
   *     ed25519 identity is created or persisted)
   *   - the gateway client identifies as a control-UI (TUI) client so the
   *     server's operator-UI bypass path is reachable, but the
   *     browser-origin enforcement path is not
   *   - the underlying WebSocket sends a recognisable `User-Agent` so the
   *     connection isn't blocked by edge protections (e.g. AWS WAF) that
   *     reject empty UA strings
   *
   * The target gateway must already opt in to operator-UI-without-device
   * via `gateway.controlUi.dangerouslyDisableDeviceAuth=true`. Bridge mode
   * does not introduce a new bypass — it surfaces the existing one as a
   * documented client-side flag so downstream consumers don't have to
   * hand-patch the compiled `client-*.js` / `acp-cli-*.js` bundles.
   */
  bridgeMode?: boolean;
};

export type SessionAcpIdentitySource = "ensure" | "status" | "event";

export type SessionAcpIdentityState = "pending" | "resolved";

export type SessionAcpIdentity = {
  /** Pending identities may expose provisional ids; resolved identities are safe for resume output. */
  state: SessionAcpIdentityState;
  acpxRecordId?: string;
  acpxSessionId?: string;
  agentSessionId?: string;
  /** Runtime lifecycle point that last supplied the identity fields. */
  source: SessionAcpIdentitySource;
  lastUpdatedAt: number;
};

export type AcpSessionRuntimeOptions = {
  /**
   * ACP runtime mode set via session/set_mode (for example: "plan", "normal", "auto").
   */
  runtimeMode?: string;
  /** ACP runtime config option: model id. */
  model?: string;
  /** ACP runtime config option: thinking/reasoning effort. */
  thinking?: string;
  /** Working directory override for ACP session turns. */
  cwd?: string;
  /** ACP runtime config option: permission profile id. */
  permissionProfile?: string;
  /** ACP runtime config option: per-turn timeout in seconds. */
  timeoutSeconds?: number;
  /** Backend-specific option bag mapped through session/set_config_option. */
  backendExtras?: Record<string, string>;
};

export type SessionAcpMeta = {
  backend: string;
  agent: string;
  runtimeSessionName: string;
  /** Canonical backend/agent ids used for resume hints and thread/status details. */
  identity?: SessionAcpIdentity;
  mode: "persistent" | "oneshot";
  runtimeOptions?: AcpSessionRuntimeOptions;
  cwd?: string;
  state: "idle" | "running" | "error";
  lastActivityAt: number;
  lastError?: string;
};
