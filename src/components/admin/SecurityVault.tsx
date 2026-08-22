import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Callout,
  Classes,
  Dialog,
  Elevation,
  FormGroup,
  HTMLSelect,
  HTMLTable,
  InputGroup,
  Intent,
  NonIdealState,
  Section,
  SectionCard,
  Tag,
} from "@blueprintjs/core";
import { StatusIndicator, type StatusTone } from "./StatusIndicator";

interface ApiKey {
  id: string;
  name: string;
  /** Non-secret display fragment only. The full secret is never held per row. */
  prefix: string;
  role: "ADMIN" | "OPERATOR" | "READ_ONLY";
  created: string;
  lastUsed: string;
  status: "ACTIVE" | "REVOKED";
}

interface SecurityVaultProps {
  isDarkMode: boolean;
}

const STATUS_PRESENTATION: Record<ApiKey["status"], { tone: StatusTone; label: string }> = {
  ACTIVE: { tone: "success", label: "Active" },
  REVOKED: { tone: "neutral", label: "Revoked" },
};

const ROLE_LABEL: Record<ApiKey["role"], string> = {
  ADMIN: "Admin",
  OPERATOR: "Operator",
  READ_ONLY: "Read-only",
};

/** Fixed-width mask so a hidden secret leaks neither its value nor its length. */
const SECRET_MASK = "•".repeat(48);

export const SecurityVault: React.FC<SecurityVaultProps> = ({ isDarkMode }) => {
  const [keys, setKeys] = useState<ApiKey[]>([
    {
      id: "key-x52-root",
      name: "Production Ingestion Root Key",
      prefix: "x52_live_9f8a",
      role: "ADMIN",
      created: "2026-08-01",
      lastUsed: "2m ago",
      status: "ACTIVE",
    },
    {
      id: "key-foundry-bridge",
      name: "Foundry Data Sync Service Token",
      prefix: "x52_live_3c2d",
      role: "OPERATOR",
      created: "2026-08-10",
      lastUsed: "Just now",
      status: "ACTIVE",
    },
    {
      id: "key-analyst-ro",
      name: "BI & Dashboard Read-Only Token",
      prefix: "x52_live_1e7b",
      role: "READ_ONLY",
      created: "2026-08-15",
      lastUsed: "4h ago",
      status: "ACTIVE",
    },
  ]);

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newRole, setNewRole] = useState<ApiKey["role"]>("OPERATOR");
  const [showNameError, setShowNameError] = useState(false);
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
  // Masked until the operator explicitly asks to see it.
  const [isSecretRevealed, setIsSecretRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copyTimer.current !== null) clearTimeout(copyTimer.current);
    },
    [],
  );

  const closeGenerateDialog = () => {
    setIsGenerateOpen(false);
    // Drop the plaintext secret from component state as soon as the dialog goes away.
    setGeneratedSecret(null);
    setIsSecretRevealed(false);
    setShowNameError(false);
    setCopied(false);
    setCopyError(null);
  };

  const handleCreateKey = () => {
    const name = newKeyName.trim();
    if (!name) {
      setShowNameError(true);
      return;
    }
    const hex = Math.random().toString(16).substring(2, 6);
    const created: ApiKey = {
      id: `key-${Date.now()}`,
      name,
      prefix: `x52_live_${hex}`,
      role: newRole,
      created: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
      status: "ACTIVE",
    };
    const secret = `x52_live_${hex}_${Math.random().toString(36).substring(2)}${Math.random()
      .toString(36)
      .substring(2)}`;
    setKeys((prev) => [created, ...prev]);
    setGeneratedSecret(secret);
    setIsSecretRevealed(false);
    setShowNameError(false);
    setNewKeyName("");
  };

  const handleCopySecret = async () => {
    if (!generatedSecret) return;
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(generatedSecret);
      setCopied(true);
      if (copyTimer.current !== null) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => {
        copyTimer.current = null;
        setCopied(false);
      }, 2000);
    } catch {
      // Clipboard access is denied outside a secure context or without a user gesture.
      setCopyError("Clipboard access was denied. Reveal the key and copy it manually.");
    }
  };

  const handleRevokeKey = (id: string) => {
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status: "REVOKED" } : k)));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--x52-space-4)" }}>
      <Section
        compact
        elevation={Elevation.ZERO}
        title="API authentication & secret tokens"
        subtitle="Signed tokens for external microservices, CI/CD pipelines, and Foundry sync."
        rightElement={
          <Button
            intent={Intent.PRIMARY}
            icon="key"
            text="Generate API key"
            onClick={() => {
              setGeneratedSecret(null);
              setIsSecretRevealed(false);
              setShowNameError(false);
              setIsGenerateOpen(true);
            }}
          />
        }
      >
        <SectionCard padded={false}>
          {keys.length === 0 ? (
            <NonIdealState
              icon="key"
              title="No API keys issued"
              description="Generate a token to let an external service authenticate against the control plane."
              layout="horizontal"
            />
          ) : (
            <HTMLTable compact style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th scope="col">Token</th>
                  <th scope="col">Key</th>
                  <th scope="col">Role</th>
                  <th scope="col">Created</th>
                  <th scope="col">Last used</th>
                  <th scope="col">Status</th>
                  <th scope="col" style={{ textAlign: "right" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => {
                  const presentation = STATUS_PRESENTATION[key.status];
                  const isRevoked = key.status === "REVOKED";
                  return (
                    <tr key={key.id} className="x52-table-row">
                      <td
                        style={{
                          fontWeight: "var(--x52-fw-medium)",
                          color: isRevoked ? "var(--x52-text-muted)" : undefined,
                        }}
                      >
                        {key.name}
                      </td>
                      <td
                        className="x52-numeric x52-muted"
                        title="Only the key prefix is stored for display; the secret remainder is never held by the client."
                      >
                        {/* Only the non-secret prefix is ever rendered for a stored key. */}
                        {`${key.prefix}••••••••`}
                      </td>
                      <td>
                        <Tag minimal>{ROLE_LABEL[key.role]}</Tag>
                      </td>
                      <td className="x52-numeric x52-muted">{key.created}</td>
                      <td className="x52-muted">{key.lastUsed}</td>
                      <td>
                        <StatusIndicator tone={presentation.tone} label={presentation.label} />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {!isRevoked && (
                          <Button
                            variant="outlined"
                            size="small"
                            intent={Intent.DANGER}
                            icon="disable"
                            text="Revoke"
                            aria-label={`Revoke API key ${key.name}`}
                            onClick={() => handleRevokeKey(key.id)}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </HTMLTable>
          )}
        </SectionCard>
      </Section>

      {/* Generate key dialog */}
      <Dialog
        isOpen={isGenerateOpen}
        onClose={closeGenerateDialog}
        title="Generate new API access key"
        className={isDarkMode ? Classes.DARK : undefined}
      >
        <div className={Classes.DIALOG_BODY}>
          {!generatedSecret ? (
            <>
              <FormGroup
                label="Token description"
                labelFor="key-name"
                labelInfo="(required)"
                intent={showNameError ? Intent.DANGER : Intent.NONE}
                helperText={showNameError ? "A token description is required." : undefined}
              >
                <InputGroup
                  id="key-name"
                  placeholder="e.g. Ingestion Pipeline Worker #3"
                  intent={showNameError ? Intent.DANGER : Intent.NONE}
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </FormGroup>

              <FormGroup
                label="Access role"
                labelFor="key-role"
                helperText="Grant the narrowest role the caller can operate with."
              >
                <HTMLSelect
                  id="key-role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as ApiKey["role"])}
                  fill
                >
                  <option value="OPERATOR">Operator — read, trigger ingestion, stream telemetry</option>
                  <option value="ADMIN">Admin — full cluster control, node scaling, key management</option>
                  <option value="READ_ONLY">Read-only — metrics and dashboards</option>
                </HTMLSelect>
              </FormGroup>
            </>
          ) : (
            <Callout intent={Intent.WARNING} title="Secret key generated">
              <p style={{ margin: "0 0 var(--x52-space-3) 0" }}>
                This key is shown once and is not recoverable. Copy it into your secret store
                before closing this dialog.
              </p>
              <div style={{ display: "flex", gap: "var(--x52-space-2)", alignItems: "center" }}>
                <code
                  className="x52-numeric"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: "var(--x52-space-2)",
                    backgroundColor: "var(--x52-card-secondary)",
                    color: "var(--x52-text)",
                    border: "1px solid var(--x52-border-subtle)",
                    borderRadius: "var(--x52-radius)",
                    fontSize: "var(--x52-fs-small)",
                    wordBreak: "break-all",
                  }}
                >
                  {isSecretRevealed ? generatedSecret : SECRET_MASK}
                </code>
                <Button
                  variant="minimal"
                  icon={isSecretRevealed ? "eye-off" : "eye-open"}
                  aria-label={isSecretRevealed ? "Hide secret key" : "Reveal secret key"}
                  aria-pressed={isSecretRevealed}
                  onClick={() => setIsSecretRevealed((revealed) => !revealed)}
                />
                <Button
                  icon={copied ? "tick" : "clipboard"}
                  text={copied ? "Copied" : "Copy"}
                  aria-label="Copy secret key to clipboard"
                  onClick={() => void handleCopySecret()}
                />
              </div>
              {copyError && (
                <p
                  role="alert"
                  style={{ margin: "var(--x52-space-2) 0 0 0", fontSize: "var(--x52-fs-small)" }}
                >
                  {copyError}
                </p>
              )}
            </Callout>
          )}
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              variant="minimal"
              text={generatedSecret ? "Done" : "Cancel"}
              onClick={closeGenerateDialog}
            />
            {!generatedSecret && (
              <Button intent={Intent.PRIMARY} text="Generate secret" onClick={handleCreateKey} />
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
};
