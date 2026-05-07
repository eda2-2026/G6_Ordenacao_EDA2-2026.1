import Link from "next/link";
import { Wallet, Camera, BarChart3, Users, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Konta — Controle financeiro inteligente para o seu time",
  description: "Registre, visualize e exporte. Konta usa IA para transformar fotos de comprovantes em lançamentos prontos.",
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary">
              <Wallet className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Konta</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#recursos" className="hover:text-foreground">Recursos</a>
            <a href="#como" className="hover:text-foreground">Como funciona</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost"><Link href="/login">Entrar</Link></Button>
            <Button asChild className="bg-gradient-primary text-primary-foreground"><Link href="/cadastro">Criar conta</Link></Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-[0.06]" />
        <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center relative">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground mb-6">
              <Sparkles className="h-3 w-3" /> Novo · Reconhecimento por IA
            </div>
            <h1 className="text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
              Controle financeiro <span className="text-gradient">sem planilhas</span>, sem dor de cabeça.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Konta é a plataforma colaborativa que transforma fotos de comprovantes em lançamentos prontos. Dashboards em tempo real, relatórios em PDF e Excel, e múltiplos usuários por grupo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow">
                <Link href="/cadastro">Criar conta <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/dashboard">Ver demo ao vivo</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> LGPD compliant</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Multi-empresa</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> 100% gratuito</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-primary opacity-20 blur-3xl rounded-3xl" />
            <div className="relative rounded-2xl bg-card border shadow-elegant p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-xs text-muted-foreground">Saldo do mês</div>
                  <div className="text-3xl font-semibold">R$ 24.870,50</div>
                </div>
                <div className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">+12,4%</div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="rounded-xl bg-success/10 p-4">
                  <div className="text-xs text-muted-foreground">Entradas</div>
                  <div className="text-lg font-semibold text-success">R$ 34.000</div>
                </div>
                <div className="rounded-xl bg-destructive/10 p-4">
                  <div className="text-xs text-muted-foreground">Saídas</div>
                  <div className="text-lg font-semibold text-destructive">R$ 9.129</div>
                </div>
              </div>
              <div className="h-32 flex items-end gap-2">
                {[40, 65, 35, 80, 55, 95, 70].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-md bg-gradient-primary" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="recursos" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-4xl font-semibold tracking-tight">Tudo que sua equipe precisa</h2>
          <p className="mt-3 text-muted-foreground">Construído para grupos, equipes e empresas que querem velocidade sem perder controle.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Camera, title: "Foto vira lançamento", desc: "Tire foto do comprovante e a IA extrai valor, data, categoria e estabelecimento." },
            { icon: BarChart3, title: "Dashboards ao vivo", desc: "Saldo, fluxo de caixa, distribuição por categoria — tudo atualizado em tempo real." },
            { icon: Users, title: "Multi-usuário", desc: "Admin, Financeiro e Visualizador. Cada grupo no seu próprio ambiente isolado." },
            { icon: Wallet, title: "Relatórios prontos", desc: "Exporte PDF formatado e Excel com filtros por período, categoria e responsável." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl bg-gradient-card border p-6 hover:shadow-elegant transition-shadow">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary mb-4">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="como" className="bg-muted/30 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-semibold tracking-tight text-center mb-14">Em 3 passos</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "01", t: "Foto do comprovante", d: "Suba pela câmera ou upload — PIX, NF, recibo ou cupom." },
              { n: "02", t: "IA preenche tudo", d: "Gemini Vision extrai dados e sugere a categoria certa." },
              { n: "03", t: "Confirma e pronto", d: "Revisão rápida, salva e dashboard atualizado." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl bg-card border p-6">
                <div className="text-5xl font-bold text-gradient mb-3">{s.n}</div>
                <h3 className="font-semibold mb-1">{s.t}</h3>
                <p className="text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="rounded-3xl bg-gradient-hero p-12 lg:p-16 text-white shadow-elegant">
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight">Comece em menos de 2 minutos</h2>
          <p className="mt-4 text-white/80 max-w-xl mx-auto">Crie seu grupo, convide o time e registre seu primeiro lançamento por foto. 100% gratuito.</p>
          <Button asChild size="lg" className="mt-8 bg-white text-foreground hover:bg-white/90">
            <Link href="/cadastro">Criar conta <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 Konta · Controle financeiro inteligente
      </footer>
    </div>
  );
}
