"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Copy, Users, Plus, LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";
import { useGrupoStore } from "@/store/useGrupoStore";

interface GroupInfo {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  role: string;
  membersCount: number;
  transactionsCount: number;
}

export default function GrupoPage() {
  const { data: session } = useSession();
  const { setActiveGroup } = useGrupoStore();
  const [groups, setGroups] = useState<GroupInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await fetch("/api/grupos");
      const json = await res.json();
      if (json.data) {
        setGroups(json.data);
        if (json.data.length > 0) {
          setActiveGroup({ id: json.data[0].id, name: json.data[0].name, role: json.data[0].role });
        }
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [setActiveGroup]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  async function handleCreate() {
    if (!createName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/grupos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName, description: createDesc }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error); return; }
      toast.success("Grupo criado!");
      setShowCreate(false);
      setCreateName("");
      setCreateDesc("");
      fetchGroups();
      // Force page reload to update session with new groupId
      window.location.reload();
    } catch { toast.error("Erro ao criar grupo"); } finally { setSubmitting(false); }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/grupos/entrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: joinCode }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error); return; }
      toast.success("Entrou no grupo!");
      setShowJoin(false);
      setJoinCode("");
      fetchGroups();
      window.location.reload();
    } catch { toast.error("Erro ao entrar no grupo"); } finally { setSubmitting(false); }
  }

  function copyInvite(code: string) {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado!");
  }

  // No groups - show onboarding
  if (!loading && groups.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight font-display">Bem-vindo ao Konta!</h1>
          <p className="text-muted-foreground mt-1.5">Para começar, crie um grupo ou entre em um existente</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 max-w-2xl">
          <Card className="cursor-pointer hover:shadow-elegant transition-all border-2 hover:border-primary/50" onClick={() => setShowCreate(true)}>
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg font-display">Criar novo grupo</h3>
              <p className="text-sm text-muted-foreground mt-2">Crie um grupo para sua empresa ou equipe</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-elegant transition-all border-2 hover:border-primary/50" onClick={() => setShowJoin(true)}>
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <LogIn className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg font-display">Entrar com código</h3>
              <p className="text-sm text-muted-foreground mt-2">Use um código de convite para entrar em um grupo</p>
            </CardContent>
          </Card>
        </div>

        {/* Create Dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="font-display">Criar Grupo</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2"><Label>Nome do grupo</Label><Input value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="Ex: Minha Empresa" /></div>
              <div className="space-y-2"><Label>Descrição (opcional)</Label><Input value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} placeholder="Controle financeiro..." /></div>
              <Button onClick={handleCreate} disabled={submitting} className="w-full bg-gradient-primary hover:opacity-90">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar grupo"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Join Dialog */}
        <Dialog open={showJoin} onOpenChange={setShowJoin}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="font-display">Entrar no Grupo</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2"><Label>Código de convite</Label><Input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="Cole o código aqui" className="font-mono" /></div>
              <Button onClick={handleJoin} disabled={submitting} className="w-full bg-gradient-primary hover:opacity-90">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const activeGroup = groups[0];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight font-display">Grupo</h1>
        <p className="text-muted-foreground mt-1.5">Gerencie seu grupo e membros</p>
      </div>

      {activeGroup && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="font-display">Informações do grupo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><span className="text-sm text-muted-foreground">Nome</span><p className="font-medium text-lg">{activeGroup.name}</p></div>
              {activeGroup.description && <div><span className="text-sm text-muted-foreground">Descrição</span><p className="text-sm">{activeGroup.description}</p></div>}
              <div className="flex gap-6 pt-2">
                <div><span className="text-2xl font-bold font-display">{activeGroup.membersCount}</span><p className="text-xs text-muted-foreground">Membros</p></div>
                <div><span className="text-2xl font-bold font-display">{activeGroup.transactionsCount}</span><p className="text-xs text-muted-foreground">Lançamentos</p></div>
              </div>
              <div className="pt-2"><span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{activeGroup.role}</span></div>
              <Link href="/grupo/membros"><Button variant="outline" className="w-full mt-2"><Users className="h-4 w-4 mr-2" /> Gerenciar membros</Button></Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display flex items-center gap-2"><Users className="h-5 w-5" /> Código de convite</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <code className="flex-1 rounded-lg bg-muted px-4 py-3 text-sm font-mono tracking-widest select-all">{activeGroup.inviteCode}</code>
                <Button variant="outline" size="icon" onClick={() => copyInvite(activeGroup.inviteCode)}><Copy className="h-4 w-4" /></Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">Compartilhe este código para convidar novos membros</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
