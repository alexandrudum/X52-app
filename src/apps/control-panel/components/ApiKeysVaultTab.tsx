import React, { useState, useEffect } from "react";
import {
  Card,
  Elevation,
  Button,
  Tag,
  Intent,
  HTMLTable,
  Callout,
  InputGroup,
  Dialog,
  Classes,
  Icon,
} from "@blueprintjs/core";

export interface ApiTokenRecord {
  id: string;
  name: string;
  prefix: string;
  token?: string;
  role: "SUPER_ADMIN" | "WRITE_INGEST" | "READ_ONLY" | "PIPELINE_RUNNER";
  scopes: string[];
  createdAt: string;
  expiresAt: string;
  lastUsedAt: string | null;
  status: "ACTIVE" | "REVOKED";
}

export const ApiKeysVaultTab: React.FC = () => {
  const [tokens, setTokens] = useState<ApiTokenRecord[]>([]);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generatedSecretToken, setGeneratedSecretToken] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Generator form
  const [tokenName, setTokenName] = useState("");
  const [role, setRole] = useState<ApiTokenRecord["role"]>("WRITE_INGEST");
  const [expiresInDays, setExpiresInDays] = useState(365);

  const fetchTokens = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/tokens");
      const json = await res.json();
      if (json.success) setTokens(json.data);
    } catch (err) {
      console.error("Fetch tokens error:", err);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleGenerateToken = async () => {
    if (!tokenName.trim()) return;
    try {
      const res = await fetch("http://localhost:4000/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tokenName,
          role,
          scopes: role === "SUPER_ADMIN" ? ["*"] : ["documents:write", "diff:execute", "ontology:read"],
          expiresInDays,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setGeneratedSecretToken(json.data.token);
        setTokenName("");
        setActionMessage(`API Key [${json.data.name}] generated successfully.`);
        fetchTokens();
      }
    } catch (err) {
      console.error("Generate token error:", err);
    }
  };

  const handleRevokeToken = async (id: string, name: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/tokens/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setActionMessage(`API Key [${name}] was revoked.`);
        fetchTokens();
      }
    } catch (err) {
      console.error("Revoke token error:", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {actionMessage && (
        <Callout
          intent={Intent.SUCCESS}
          icon="tick-circle"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <span>{actionMessage}</span>
          <Button variant="minimal" icon="cross" size="small" onClick={() => setActionMessage(null)} />
        </Callout>
      )}

      {/* Action Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <div style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
          Cryptographically signed API keys for programmatic pipeline access, CI/CD integrations, and document ingestion workers.
        </div>
        <Button
          intent={Intent.PRIMARY}
          icon="key"
          text="Generate New API Key"
          onClick={() => {
            setGeneratedSecretToken(null);
            setIsGenerateOpen(true);
          }}
        />
      </div>

      {/* Tokens Table */}
      <Card
        elevation={Elevation.ZERO}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "10px",
          padding: "18px 22px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon icon="shield" color="var(--x52-accent)" />
              Active Enterprise API Keys &amp; Secret Vault
            </h4>
            <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
              Bearer tokens with automated TTL expiration, granular permission scopes, and audit logging.
            </span>
          </div>
          <Tag round intent={Intent.SUCCESS}>{tokens.filter((t) => t.status === "ACTIVE").length} Active Keys</Tag>
        </div>

        <HTMLTable bordered compact striped style={{ width: "100%", fontSize: "12px" }}>
          <thead>
            <tr>
              <th>Key Name</th>
              <th>Token Prefix</th>
              <th>Assigned Role</th>
              <th>Permission Scopes</th>
              <th>Created Date</th>
              <th>Expires At</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((t) => (
              <tr key={t.id}>
                <td><strong>{t.name}</strong></td>
                <td><code>{t.prefix}••••••••</code></td>
                <td><Tag minimal intent={t.role === "SUPER_ADMIN" ? Intent.DANGER : Intent.PRIMARY}>{t.role}</Tag></td>
                <td><code>{t.scopes.join(", ")}</code></td>
                <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                <td>{new Date(t.expiresAt).toLocaleDateString()}</td>
                <td>
                  <Tag
                    intent={t.status === "ACTIVE" ? Intent.SUCCESS : Intent.DANGER}
                    round
                    style={{ fontWeight: 800 }}
                  >
                    ● {t.status}
                  </Tag>
                </td>
                <td>
                  <Button
                    size="small"
                    variant="outlined"
                    intent={Intent.DANGER}
                    icon="trash"
                    text="Revoke"
                    disabled={t.status === "REVOKED"}
                    onClick={() => handleRevokeToken(t.id, t.name)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </Card>

      {/* Generate API Key Dialog */}
      <Dialog
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate New Enterprise API Key"
        icon="key"
        style={{ width: "560px", backgroundColor: "var(--x52-card-bg)", color: "inherit" }}
      >
        <div className={Classes.DIALOG_BODY} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {generatedSecretToken ? (
            <Callout intent={Intent.WARNING} icon="warning-sign" title="Copy your Secret Token Now">
              <p style={{ margin: "4px 0 10px 0", fontSize: "12px" }}>
                This secret token will <strong>never be displayed again</strong>. Copy it immediately to your secure vault:
              </p>
              <div style={{ padding: "10px", backgroundColor: "rgba(0,0,0,0.4)", borderRadius: "6px", fontFamily: "var(--x52-font-mono)", fontSize: "12px", wordBreak: "break-all" }}>
                {generatedSecretToken}
              </div>
              <Button
                intent={Intent.PRIMARY}
                icon="clipboard"
                text="Copy to Clipboard"
                style={{ marginTop: "10px" }}
                onClick={() => {
                  navigator.clipboard.writeText(generatedSecretToken);
                  setActionMessage("Secret Token copied to clipboard!");
                }}
              />
            </Callout>
          ) : (
            <>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Key Description / Consumer Name</label>
                <InputGroup
                  placeholder="e.g. Ingestion Pipeline Worker Node #4"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>Role &amp; Privilege Scope</label>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  {(["WRITE_INGEST", "READ_ONLY", "PIPELINE_RUNNER", "SUPER_ADMIN"] as ApiTokenRecord["role"][]).map((r) => (
                    <Button
                      key={r}
                      size="small"
                      active={role === r}
                      intent={role === r ? Intent.PRIMARY : Intent.NONE}
                      text={r.replace("_", " ")}
                      onClick={() => setRole(r)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700 }}>TTL Expiration</label>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  {[30, 90, 180, 365].map((days) => (
                    <Button
                      key={days}
                      size="small"
                      active={expiresInDays === days}
                      text={`${days} Days`}
                      onClick={() => setExpiresInDays(days)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button text={generatedSecretToken ? "Done" : "Cancel"} onClick={() => setIsGenerateOpen(false)} />
            {!generatedSecretToken && (
              <Button intent={Intent.PRIMARY} icon="key" text="Generate Key" onClick={handleGenerateToken} />
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
};
