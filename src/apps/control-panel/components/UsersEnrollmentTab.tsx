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

export interface EnterpriseUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "DATA_GOVERNOR" | "MODEL_ENGINEER" | "AUDITOR" | "VIEWER";
  department: string;
  assignedPurposes: string[];
  mfaEnabled: boolean;
  activeSessions: number;
  lastLogin: string;
  status: "ACTIVE" | "SUSPENDED" | "INVITED";
}

export const UsersEnrollmentTab: React.FC = () => {
  const [users, setUsers] = useState<EnterpriseUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Invite form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("Avionics Engineering");
  const [role, setRole] = useState<EnterpriseUser["role"]>("MODEL_ENGINEER");

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/users");
      const json = await res.json();
      if (json.success) setUsers(json.data);
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInviteUser = async () => {
    if (!name.trim() || !email.trim()) return;
    try {
      const res = await fetch("http://localhost:4000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, department, role }),
      });
      const json = await res.json();
      if (json.success) {
        setIsInviteOpen(false);
        setName("");
        setEmail("");
        setActionMessage(`Invitation sent to ${email} with assigned role [${role}].`);
        fetchUsers();
      }
    } catch (err) {
      console.error("Invite error:", err);
    }
  };

  const handleRevokeSessions = async (id: string, userName: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/users/${id}/revoke`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setActionMessage(`All active login sessions for ${userName} revoked.`);
        fetchUsers();
      }
    } catch (err) {
      console.error("Revoke error:", err);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ width: "320px" }}>
          <InputGroup
            leftIcon="search"
            placeholder="Search users, email, department, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            intent={Intent.PRIMARY}
            icon="add"
            text="Invite Enterprise User"
            onClick={() => setIsInviteOpen(true)}
          />
          <Button icon="refresh" variant="outlined" text="Refresh Directory" onClick={fetchUsers} />
        </div>
      </div>

      {/* Users Table */}
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
              <Icon icon="people" color="var(--x52-accent)" />
              Enterprise Users &amp; Access Delegation
              <Tag minimal intent={Intent.PRIMARY}>Multi-Tenant Directory</Tag>
            </h4>
            <span style={{ fontSize: "12px", color: "var(--x52-text-muted)" }}>
              Manage individual enrollments, enforce Multi-Factor Authentication (MFA), and assign PBAC purpose scopes.
            </span>
          </div>
          <Tag round intent={Intent.SUCCESS}>{filteredUsers.length} Enrolled Accounts</Tag>
        </div>

        <HTMLTable bordered compact striped style={{ width: "100%", fontSize: "12px" }}>
          <thead>
            <tr>
              <th>User Name &amp; Email</th>
              <th>Department</th>
              <th>Assigned Role</th>
              <th>MFA Status</th>
              <th>Active Sessions</th>
              <th>Last Login</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>
                  <strong>{u.name}</strong>
                  <div style={{ fontSize: "11px", color: "var(--x52-text-muted)" }}><code>{u.email}</code></div>
                </td>
                <td>{u.department}</td>
                <td>
                  <Tag
                    minimal
                    intent={
                      u.role === "SUPER_ADMIN"
                        ? Intent.DANGER
                        : u.role === "DATA_GOVERNOR"
                        ? Intent.PRIMARY
                        : Intent.SUCCESS
                    }
                  >
                    {u.role}
                  </Tag>
                </td>
                <td>
                  <Tag minimal intent={u.mfaEnabled ? Intent.SUCCESS : Intent.WARNING}>
                    {u.mfaEnabled ? "MFA Active" : "Disabled"}
                  </Tag>
                </td>
                <td>
                  <strong>{u.activeSessions}</strong> {u.activeSessions === 1 ? "session" : "sessions"}
                </td>
                <td>
                  <span style={{ fontSize: "11px" }}>
                    {u.lastLogin.includes("T") ? new Date(u.lastLogin).toLocaleTimeString() : u.lastLogin}
                  </span>
                </td>
                <td>
                  <Tag
                    intent={u.status === "ACTIVE" ? Intent.SUCCESS : Intent.WARNING}
                    round
                    style={{ fontWeight: 800 }}
                  >
                    ● {u.status}
                  </Tag>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <Button
                      size="small"
                      variant="outlined"
                      intent={Intent.WARNING}
                      icon="log-out"
                      text="Revoke"
                      disabled={u.activeSessions === 0}
                      onClick={() => handleRevokeSessions(u.id, u.name)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </Card>

      {/* Invite User Dialog */}
      <Dialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Enterprise User to Workspace"
        icon="add"
        style={{ width: "520px", backgroundColor: "var(--x52-card-bg)", color: "inherit" }}
      >
        <div className={Classes.DIALOG_BODY} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700 }}>Full Name</label>
            <InputGroup placeholder="e.g. John Doe" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700 }}>Corporate Email</label>
            <InputGroup placeholder="e.g. john.doe@defense.aero" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700 }}>Department / Team</label>
            <InputGroup placeholder="e.g. Avionics Compliance" value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 700 }}>Platform Role</label>
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              {(["SUPER_ADMIN", "DATA_GOVERNOR", "MODEL_ENGINEER", "AUDITOR"] as EnterpriseUser["role"][]).map((r) => (
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
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button text="Cancel" onClick={() => setIsInviteOpen(false)} />
            <Button intent={Intent.PRIMARY} icon="envelope" text="Send Invite" onClick={handleInviteUser} />
          </div>
        </div>
      </Dialog>
    </div>
  );
};
