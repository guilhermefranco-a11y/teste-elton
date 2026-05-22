import React, { useState, useEffect } from "react";
import { ShieldCheck, Cpu, Clock, RefreshCw } from "lucide-react";

interface HeaderProps {
  modelLoaded: boolean;
  isSimulating: boolean;
  onReloadModel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  modelLoaded,
  isSimulating,
  onReloadModel,
}) => {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    // Real-time UTC clock alignment with user specifications
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-zinc-800 bg-[#0a0a0a] py-4 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-lg tracking-tight text-white">
                SENTRY<span className="text-blue-500">CAM</span>
              </h1>
              <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700/50 px-1.5 py-0.5 rounded font-mono font-medium">
                v2.4 Pro
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Biometria Facial & Controle de Presença Escolar
            </p>
          </div>
        </div>

        {/* STATUS BAR */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Relógio em tempo real */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-1.5 text-slate-350 font-mono transition-colors">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span>{time || "00:00:00"}</span>
          </div>

          {/* Motor IA Status */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-1.5 text-slate-350">
            <Cpu className="h-3.5 w-3.5 text-blue-400" />
            <span className="mr-1">Motor IA:</span>
            {modelLoaded ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                TF.JS ATIVO
              </span>
            ) : isSimulating ? (
              <span className="text-amber-400 font-medium font-mono flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 inline-block"></span>
                SIMULADO
              </span>
            ) : (
              <span className="text-slate-500 font-medium font-mono">INATIVO</span>
            )}
          </div>

          {/* Recarregar Modelo */}
          <button
            onClick={onReloadModel}
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 rounded-lg px-3 py-1.5 transition-all text-xs font-semibold cursor-pointer"
            title="Recarregar modelo da pasta ./my_model"
          >
            <RefreshCw className="h-3.5 w-3.5 text-indigo-400" />
            <span>Recarregar Modelo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
