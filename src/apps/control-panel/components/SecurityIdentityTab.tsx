import React, { useState } from "react";
import {
  Card,
  Elevation,
  Button,
  Tag,
  Intent,
  HTMLTable,
  Callout,
  Tooltip,
  InputGroup,
  Dialog,
  Classes,
  Icon,
} from "@blueprintjs/core";
import type { PBACPurposeData, ApprovalRequestData, SecurityTelemetryData } from "../types";

export const SecurityIdentityTab: React.FC<{
  pbacPurposes: PBACPurposeData[];
  approvalRequests: ApprovalRequestData[];
  security: SecurityTelemetryData | null;
  onRefresh: () => void;
}> = ({ pbacPurposes, approvalRequests, security, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequestData | null>(null);
  const [isNewPurposeOpen, setIsNewPurposeOpen] = useState(false);

  // New Purpose Form state
  const [newPurposeName, setNewPurposeName] = useState("");
  const [newPurposeCode, setNewPurposeCode] = useState("");
  const [newPurposeDesc, setNewPurposeDesc] = useState("");

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
        if (selectedApproval && selectedApproval.id === id) {
          setSelectedApproval(json.data);
        }
        onRefresh();
      }
    } catch (err) {
      console.error("Decision error:", err);
    } finally {
      setDecidingId(null);
    }
  };

  const filteredPurposes = pbacPurposes.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApprovals = approvalRequests.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.justification.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Global Filter Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ width: "320px" }}>
          <InputGroup
            leftIcon="search"
            placeholder="Search purposes, approvals, permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            intent={Intent.PRIMARY}
            icon="plus"
            text="Create New Purpose (PBAC)"
            onClick={() => setIsNewPurposeOpen(true)}
          />
          <Button icon="refresh" variant="outlined" text="Sync Zero Trust" onClick={onRefresh} />
        </div>
      </div>

      {/* 1. Purpose-Based Access Controls (PBAC) */}
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
              Purpose-Based Access Controls (PBAC)
              <Tag minimal intent={Intent.PRIMARY}>Zero Trust Policy Center</Tag>
            </h4>
            <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
              Data access is cryptographically bounded to verified operational purposes rather than static user roles.
            </span>
          </div>
          <Tag round intent={Intent.SUCCESS}>{filteredPurposes.length} Active Purposes</Tag>
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
              <th>Compliance Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurposes.map((p) => (
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
          borderRadius: "10px",
          padding: "18px 22px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon icon="confirm" color="var(--x52-accent)" />
              Multi-Party Approval Workflows
              {pendingApprovals.length > 0 && (
                <Tag intent={Intent.WARNING} round style={{ fontWeight: 800 }}>
                  {pendingApprovals.length} PENDING REVIEW
                </Tag>
              )}
            </h4>
            <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
              Formal sign-off queue for high-risk operations: data access grants, schema modifications, and SLA indemnity waivers.
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
            {filteredApprovals.map((req) => (
              <tr key={req.id}>
                <td>
                  <strong
                    style={{ cursor: "pointer", color: "var(--x52-accent)" }}
                    onClick={() => setSelectedApproval(req)}
                  >
                    {req.title}
                  </strong>
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
                  <div style={{ display: "flex", gap: "6px" }}>
                    <Button
                      size="small"
                      variant="outlined"
                      icon="eye-open"
                      text="Inspect"
                      onClick={() => setSelectedApproval(req)}
                    />
                    {req.status === "PENDING" && (
                      <>
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
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </Card>

      {/* 3. Authentication & IdP Integrations */}
      {security && (
        <Card
          elevation={Elevation.ZERO}
          style={{
            backgroundColor: "var(--x52-card-bg)",
            border: "1px solid var(--x52-border-subtle)",
            borderRadius: "10px",
            padding: "18px 22px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <Icon icon="key" color="var(--x52-accent)" />
            <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 800 }}>
              Authentication &amp; Single Sign-On (SSO) Coordinator
            </h4>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
            <div style={{ padding: "14px", border: "1px solid var(--x52-border-subtle)", borderRadius: "8px" }}>
              <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", textTransform: "uppercase" }}>Primary IdP Provider</div>
              <div style={{ fontSize: "15px", fontWeight: 800, marginTop: "4px" }}>SAML 2.0 / Okta Enterprise</div>
              <Tag minimal intent={Intent.SUCCESS} style={{ marginTop: "8px" }}>CONNECTED (Zero Trust)</Tag>
            </div>
            <div style={{ padding: "14px", border: "1px solid var(--x52-border-subtle)", borderRadius: "8px" }}>
              <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", textTransform: "uppercase" }}>Token Lifetimes &amp; MFA</div>
              <div style={{ fontSize: "15px", fontWeight: 800, marginTop: "4px" }}>8 Hours (Mandatory Re-auth)</div>
              <Tag minimal style={{ marginTop: "8px" }}>ENFORCED</Tag>
            </div>
            <div style={{ padding: "14px", border: "1px solid var(--x52-border-subtle)", borderRadius: "8px" }}>
              <div style={{ fontSize: "11px", color: "var(--x52-text-muted)", textTransform: "uppercase" }}>Active Admin Tokens</div>
              <div style={{ fontSize: "15px", fontWeight: 800, marginTop: "4px" }}>{security.apiTokens.length} Active Keys</div>
              <Tag minimal intent={Intent.PRIMARY} style={{ marginTop: "8px" }}>SUPER_ADMIN</Tag>
            </div>
          </div>
        </Card>
      )}

      {/* Interactive Approval Inspection Dialog */}
      <Dialog
        isOpen={!!selectedApproval}
        onClose={() => setSelectedApproval(null)}
        title={`Approval Request: ${selectedApproval?.id}`}
        icon="confirm"
        style={{ width: "640px", backgroundColor: "var(--x52-card-bg)", color: "inherit" }}
      >
        {selectedApproval && (
          <div className={Classes.DIALOG_BODY} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <div style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>Title</div>
              <h3 style={{ margin: "4px 0", fontSize: "16px" }}>{selectedApproval.title}</h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>Requested By:</span>
                <div><code>{selectedApproval.requestedBy}</code></div>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>Purpose Code:</span>
                <div><Tag minimal>{selectedApproval.purpose}</Tag></div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>Formal Justification:</span>
              <div style={{ padding: "10px 14px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "6px", marginTop: "4px" }}>
                {selectedApproval.justification}
              </div>
            </div>

            <div>
              <span style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}>Sign-Off History:</span>
              <div style={{ marginTop: "6px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {selectedApproval.approversCompleted.length > 0 ? (
                  selectedApproval.approversCompleted.map((appr, i) => (
                    <Tag key={i} intent={Intent.SUCCESS} icon="tick-circle">
                      Signed: {appr}
                    </Tag>
                  ))
                ) : (
                  <span style={{ color: "var(--x52-text-muted)", fontSize: "12px" }}>No signatures recorded yet.</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button text="Close" onClick={() => setSelectedApproval(null)} />
            {selectedApproval?.status === "PENDING" && (
              <>
                <Button
                  intent={Intent.DANGER}
                  icon="cross"
                  text="Reject Request"
                  loading={decidingId === selectedApproval.id}
                  onClick={() => handleDecision(selectedApproval.id, "REJECT")}
                />
                <Button
                  intent={Intent.SUCCESS}
                  icon="tick"
                  text="Sign & Approve"
                  loading={decidingId === selectedApproval.id}
                  onClick={() => handleDecision(selectedApproval.id, "APPROVE")}
                />
              </>
            )}
          </div>
        </div>
      </Dialog>

      {/* Create New PBAC Purpose Dialog */}
      <Dialog
        isOpen={isNewPurposeOpen}
        onClose={() => setIsNewPurposeOpen(false)}
        title="Create New Mission Purpose (PBAC)"
        icon="plus"
        style={{ width: "560px", backgroundColor: "var(--x52-card-bg)", color: "inherit" }}
      >
        <div className={Classes.DIALOG_BODY} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700 }}>Purpose Name</label>
            <InputGroup
              placeholder="e.g. Avionics Galley Power Diagnostics"
              value={newPurposeName}
              onChange={(e) => setNewPurposeName(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700 }}>System Code</label>
            <InputGroup
              placeholder="e.g. PURPOSE_AVIONICS_POWER"
              value={newPurposeCode}
              onChange={(e) => setNewPurposeCode(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700 }}>Operational Scope &amp; Legal Description</label>
            <InputGroup
              placeholder="Describe authorized datasets and compliance bounds..."
              value={newPurposeDesc}
              onChange={(e) => setNewPurposeDesc(e.target.value)}
            />
          </div>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button text="Cancel" onClick={() => setIsNewPurposeOpen(false)} />
            <Button
              intent={Intent.PRIMARY}
              icon="tick"
              text="Create Purpose"
              onClick={() => {
                setIsNewPurposeOpen(false);
                setActionMessage(`Purpose [${newPurposeName || "New Purpose"}] created in Zero Trust catalog.`);
              }}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};
