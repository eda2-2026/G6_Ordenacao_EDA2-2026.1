import { Wallet } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left side — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-md text-white animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-glow">
              <Wallet className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight font-display">Konta</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight font-display">
            Controle financeiro inteligente para seu negócio
          </h1>
          <p className="mt-4 text-lg text-white/70 leading-relaxed">
            Registre lançamentos, reconheça comprovantes por IA e visualize seu fluxo de caixa em tempo real.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold font-display">IA</div>
              <div className="text-xs text-white/60 mt-1">Reconhecimento</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-display">100%</div>
              <div className="text-xs text-white/60 mt-1">Gratuito</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-display">∞</div>
              <div className="text-xs text-white/60 mt-1">Lançamentos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
