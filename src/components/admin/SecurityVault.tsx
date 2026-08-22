import React, { useState } from "react";
import {
  Card,
  Elevation,
  Button,
  Tag,
  Intent,
  Callout,
  Dialog,
  FormGroup,
  InputGroup,
  HTMLSelect,
  Classes,
} from "@blueprintjs/core";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  role: "ADMIN" | "OPERATOR" | "READ_ONLY";
  created: string;
  lastUsed: string;
  status: "ACTIVE" | "REVOKED";
}

interface SecurityVaultProps {
  isDarkMode: boolean;
}

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
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateKey = () => {
    if (!newKeyName) return;
    const hex = Math.random().toString(16).substring(2, 6);
    const created: ApiKey = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      prefix: `x52_live_${hex}`,
      role: newRole,
      created: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
      status: "ACTIVE",
    };
    const secret = `x52_live_${hex}_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    setKeys([created, ...keys]);
    setGeneratedSecret(secret);
    setNewKeyName("");
  };

  const handleRevokeKey = (id: string) => {
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "REVOKED" } : k))
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Overview */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>API Authentication & Secret Tokens</h3>
          <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
            Cryptographically signed tokens for external microservices, CI/CD pipelines, and Foundry sync.
          </span>
        </div>
        <Button
          intent="primary"
          icon="key"
          text="Generate API Key"
          onClick={() => {
            setGeneratedSecret(null);
            setIsGenerateOpen(true);
          }}
        />
      </div>

      {/* Keys List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {keys.map((key) => (
          <Card
            key={key.id}
            elevation={Elevation.ONE}
            style={{
              backgroundColor: "var(--x52-card-bg)",
              border: "1px solid var(--x52-border-subtle)",
              borderRadius: "10px",
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              opacity: key.status === "REVOKED" ? 0.6 : 1,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>
                {key.name}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                <code>{key.prefix}••••••••••••</code>
                <span style={{ color: "var(--x52-text-muted)" }}>• Created {key.created} • Last used {key.lastUsed}</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Tag
                intent={key.role === "ADMIN" ? Intent.DANGER : key.role === "OPERATOR" ? Intent.PRIMARY : Intent.NONE}
                round
                minimal
                style={{ fontWeight: 700 }}
              >
                {key.role}
              </Tag>
              <Tag
                intent={key.status === "ACTIVE" ? Intent.SUCCESS : Intent.WARNING}
                round
                minimal
              >
                {key.status}
              </Tag>

              {key.status === "ACTIVE" && (
                <Button
                  minimal
                  intent="danger"
                  icon="cross"
                  text="Revoke"
                  onClick={() => handleRevokeKey(key.id)}
                />
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Generate Key Dialog */}
      <Dialog
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate New API Access Key"
        className={isDarkMode ? Classes.DARK : ""}
      >
        <div className={Classes.DIALOG_BODY}>
          {!generatedSecret ? (
            <>
              <FormGroup label="Token Description" labelFor="key-name" labelInfo="(required)">
                <InputGroup
                  id="key-name"
                  placeholder="e.g. Ingestion Pipeline Worker #3"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </FormGroup>

              <FormGroup label="Access Role & Permissions" labelFor="key-role">
                <HTMLSelect
                  id="key-role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as ApiKey["role"])}
                  fill
                >
                  <option value="OPERATOR">OPERATOR (Read, Trigger Ingestion, Stream Telemetry)</option>
                  <option value="ADMIN">ADMIN (Full Cluster Control, Node Scaling, Key Management)</option>
                  <option value="READ_ONLY">READ_ONLY (Metrics & Dashboard Read-Only)</option>
                </HTMLSelect>
              </FormGroup>
            </>
          ) : (
            <Callout intent={Intent.WARNING} title="Secret Key Generated">
              <p style={{ fontSize: "12px", margin: "0 0 10px 0" }}>
                Make sure to copy your key now. You will not be able to see it again!
              </p>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <code style={{ fontSize: "13px", padding: "8px", backgroundColor: "#000", color: "#fff", flex: 1, borderRadius: "4px", wordBreak: "break-all" }}>
                  {generatedSecret}
                </code>
                <Button
                  icon={copied ? "tick" : "clipboard"}
                  intent={copied ? "success" : "primary"}
                  onClick={() => {
                    navigator.clipboard.writeText(generatedSecret);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </Callout>
          )}
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={() => setIsGenerateOpen(false)}>
              {generatedSecret ? "Done" : "Cancel"}
            </Button>
            {!generatedSecret && (
              <Button intent="primary" text="Generate Secret" onClick={handleCreateKey} />
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
};
