"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Shield, ShieldCheck, Eye, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Member {
  id: string;
  role: "ADMIN" | "FINANCEIRO" | "VISUALIZADOR";
  user: { id: string; name: string; email: string; image?: string };
}

const ROLE_CONFIG = {
  ADMIN: { label: "Admin", icon: ShieldCheck, color: "text-primary" },
  FINANCEIRO: { label: "Financeiro", icon: Shield, color: "text-amber-600" },
  VISUALIZADOR: { label: "Visualizador", icon: Eye, color: "text-muted-foreground" },
};

export default function MembrosPage() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const groupId = session?.user?.groupId;
  const isAdmin = session?.user?.role === "ADMIN";

  const fetchMembers = useCallback(async () => {
    if (!groupId) return;
    try {
      const res = await fetch(`/api/grupos/${groupId}/membros`);
      const json = await res.json();
      if (json.data) setMembers(json.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [groupId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  async function handleRoleChange(userId: string, newRole: string) {
    if (!groupId) return;
    try {
      const res = await fetch(`/api/grupos/${groupId}/membros`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error); return; }
      toast.success("Role atualizada!");
      fetchMembers();
    } catch { toast.error("Erro ao alterar role"); }
  }

  async function handleRemove(userId: string, name: string) {
    if (!groupId) return;
    if (!confirm(`Remover ${name} do grupo?`)) return;
    try {
      const res = await fetch(`/api/grupos/${groupId}/membros`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error); return; }
      toast.success("Membro removido!");
      fetchMembers();
    } catch { toast.error("Erro ao remover membro"); }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight font-display">Membros</h1>
        <p className="text-muted-foreground mt-1.5">Gerencie os membros do seu grupo</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center justify-between">
            Lista de membros
            <span className="text-sm font-normal text-muted-foreground">{members.length} membro{members.length !== 1 ? "s" : ""}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : members.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum membro encontrado.</p>
          ) : (
            <div className="divide-y">
              {members.map((m) => {
                const rc = ROLE_CONFIG[m.role];
                const RoleIcon = rc.icon;
                const initials = m.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                const isSelf = m.user.id === session?.user?.id;

                return (
                  <div key={m.id} className="flex items-center gap-4 py-3.5">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm flex items-center gap-2">
                        {m.user.name} {isSelf && <span className="text-xs text-muted-foreground">(você)</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{m.user.email}</div>
                    </div>

                    {isAdmin && !isSelf ? (
                      <Select value={m.role} onValueChange={(v) => handleRoleChange(m.user.id, v)}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="FINANCEIRO">Financeiro</SelectItem>
                          <SelectItem value="VISUALIZADOR">Visualizador</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${rc.color}`}>
                        <RoleIcon className="h-3.5 w-3.5" /> {rc.label}
                      </span>
                    )}

                    {isAdmin && !isSelf && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemove(m.user.id, m.user.name)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
