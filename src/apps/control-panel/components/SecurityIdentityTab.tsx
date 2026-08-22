import React, { useState } from "react";
import { Card, Elevation, Button, Tag, Intent, HTMLTable, Callout, Tooltip } from "@blueprintjs/core";
import type { PBACPurposeData, ApprovalRequestData, SecurityTelemetryData } from "../types";

export const SecurityIdentityTab: React.FC<{
  pbacPurposes: PBACPurposeData[];
  approvalRequests: ApprovalRequestData[];
  security: SecurityTelemetryData | null;
  onRefresh: () => void;
}> = ({ pbacPurposes, approvalRequests, security, onRefresh }) => {
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleDecision = async (id: string, decision: "APPROVE" | "REJECT") => {
    setDecidingId(id);
    try {
      const res = await fetch(`http://localhost:4000/api/governance/approvals/${id}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, approver: "super.admin@defense.aero" }),
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage(`Approval Request [${json.data.title}] marked as ${json.data.status}.`);
        onRefresh();
      }
    } catch (err) {
      console.error("Decision error:", err);
    } finally {
      setDecidingId(null);
    }
  };

  const pendingApprovals = approvalRequests.filter((a) => a.status === "PENDING");

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

      {/* 1. Purpose-Based Access Controls (PBAC) */}
      <Card
        elevation={Elevation.ZERO}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "8px",
          padding: "16px 20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
              Purpose-Based Access Controls (PBAC)
              <Tag minimal intent={Intent.PRIMARY}>Zero Trust Framework</Tag>
            </h4>
            <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
              Instead of manually gating individual tables, data is assigned to audited operational purposes with automated compliance lifecycles.
            </span>
          </div>
        </div>

        <HTMLTable bordered compact striped style={{ width: "100%", fontSize: "12px" }}>
          <thead>
            <tr>
              <th>Business / Mission Purpose</th>
              <th>System Code</th>
              <th>Assigned Datasets</th>
              <th>Authorized Users</th>
              <th>Retention Standard</th>
              <th>Designated Governor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pbacPurposes.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.name}</strong>
                  <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", marginTop: "2px" }}>{p.description}</div>
                </td>
                <td><code>{p.code}</code></td>
                <td><strong>{p.assignedDatasetsCount}</strong> datasets</td>
                <td>{p.authorizedUsersCount} accounts</td>
                <td><Tag minimal>{Math.round(p.retentionDays / 365)} Years</Tag></td>
                <td><code>{p.governor}</code></td>
                <td>
                  <Tag intent={p.status === "ACTIVE" ? Intent.SUCCESS : Intent.WARNING} round style={{ fontWeight: 800 }}>
                    ● {p.status}
                  </Tag>
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </Card>

      {/* 2. Built-in Multi-Party Approval Workflows */}
      <Card
        elevation={Elevation.ZERO}
        style={{
          backgroundColor: "var(--x52-card-bg)",
          border: "1px solid var(--x52-border-subtle)",
          borderRadius: "8px",
          padding: "16px 20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
              Multi-Party Approval Workflows
              {pendingApprovals.length > 0 && (
                <Tag intent={Intent.WARNING} round style={{ fontWeight: 800 }}>
                  {pendingApprovals.length} PENDING REVIEW
                </Tag>
              )}
            </h4>
            <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
              Sensitive workflows (data access grants, schema mutations, SLA overrides) requiring formal sign-off history before execution.
            </span>
          </div>
        </div>

        <HTMLTable bordered compact striped style={{ width: "100%", fontSize: "12px" }}>
          <thead>
            <tr>
              <th>Request Title</th>
              <th>Category</th>
              <th>Requested By</th>
              <th>Justification</th>
              <th>Sign-Off Progress</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {approvalRequests.map((req) => (
              <tr key={req.id}>
                <td>
                  <strong>{req.title}</strong>
                  <div style={{ fontSize: "10px", color: "var(--x52-text-muted)" }}><code>{req.id}</code> • {new Date(req.requestedAt).toLocaleTimeString()}</div>
                </td>
                <td><Tag minimal>{req.category}</Tag></td>
                <td><code>{req.requestedBy}</code></td>
                <td style={{ maxWidth: "260px" }}>{req.justification}</td>
                <td>
                  <Tooltip content={`Signed off by: ${req.approversCompleted.join(", ") || "None"}`}>
                    <Tag minimal intent={req.approversCompleted.length >= req.approversRequired ? Intent.SUCCESS : Intent.WARNING}>
                      {req.approversCompleted.length} of {req.approversRequired} Signatures
                    </Tag>
                  </Tooltip>
                </td>
                <td>
                  <Tag
                    intent={req.status === "APPROVED" ? Intent.SUCCESS : req.status === "PENDING" ? Intent.WARNING : Intent.DANGER}
                    round
                    style={{ fontWeight: 800 }}
                  >
                    ● {req.status}
                  </Tag>
                </td>
                <td>
                  {req.status === "PENDING" ? (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Button
                        size="small"
                        intent={Intent.SUCCESS}
                        icon="tick"
                        text="Approve"
                        loading={decidingId === req.id}
                        onClick={() => handleDecision(req.id, "APPROVE")}
                      />
                      <Button
                        size="small"
                        intent={Intent.DANGER}
                        icon="cross"
                        text="Reject"
                        loading={decidingId === req.id}
                        onClick={() => handleDecision(req.id, "REJECT")}
                      />
                    </div>
                  ) : (
                    <Tag minimal icon="tick-circle">Complete</Tag>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </Card>

      {/* 3. Authentication & IdP Management */}
      {security && (
        <Card
          elevation={Elevation.ZERO}
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: "1px solid var(--x52-border-subtle)",
            borderRadius: "8px",
            padding: "16px 20px",
          }}
        >
          <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 700 }}>
            Authentication &amp; Identity Provider (IdP) Integrations
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
            <div style={{ padding: "12px", border: "1px solid var(--x52-border-subtle)", borderRadius: "6px" }}>
              <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", textTransform: "uppercase" }}>Primary IdP Provider</div>
              <div style={{ fontSize: "14px", fontWeight: 700, marginTop: "4px" }}>SAML 2.0 / Okta Enterprise</div>
              <Tag minimal intent={Intent.SUCCESS} style={{ marginTop: "6px" }}>CONNECTED (Zero Trust)</Tag>
            </div>
            <div style={{ padding: "12px", border: "1px solid var(--x52-border-subtle)", borderRadius: "6px" }}>
              <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", textTransform: "uppercase" }}>Token Lifetimes</div>
              <div style={{ fontSize: "14px", fontWeight: 700, marginTop: "4px" }}>8 Hours (MFA Re-auth)</div>
              <Tag minimal style={{ marginTop: "6px" }}>ENFORCED</Tag>
            </div>
            <div style={{ padding: "12px", border: "1px solid var(--x52-border-subtle)", borderRadius: "6px" }}>
              <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", textTransform: "uppercase" }}>Active Admin Tokens</div>
              <div style={{ fontSize: "14px", fontWeight: 700, marginTop: "4px" }}>{security.apiTokens.length} Provisioned</div>
              <Tag minimal intent={Intent.PRIMARY} style={{ marginTop: "6px" }}>SUPER_ADMIN</Tag>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
