import React from "react";
import { Users, Fingerprint, Award } from "lucide-react";

interface KPICardsProps {
  presentCount: number;
  totalCount: number;
  modelType: "Local" | "Simulador" | "Upload";
  threshold: number;
  onThresholdChange: (val: number) => void;
}

export const KPICards: React.FC<KPICardsProps> = ({
  presentCount,
  totalCount,
  modelType,
  threshold,
  onThresholdChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {/* CARD 1: PRESENCE STATISTICS */}
      <div className="glass-effect rounded-2xl p-5 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-zinc-700/80 transition-all">
        <div className="space-y-1 z-10">
          <p className="text-xs text-zinc-400 font-medium tracking-wide">
            ALUNOS PRESENTES
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-extrabold text-white">
              {presentCount}
            </span>
            <span className="text-zinc-650 font-mono text-sm">/ {totalCount}</span>
          </div>
          <div className="pt-2 text-[11px] text-blue-400 font-medium flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 block animate-pulse"></span>
            Aulas em andamento
          </div>
        </div>
        <div className="p-3.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20 z-10">
          <Users className="h-5.5 w-5.5" />
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-60"></div>
      </div>

      {/* CARD 2: MODEL STATE */}
      <div className="glass-effect rounded-2xl p-5 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-zinc-700/80 transition-all">
        <div className="space-y-1 z-10">
          <p className="text-xs text-zinc-400 font-medium tracking-wide">
            MOTOR BIOMÉTRICO
          </p>
          <div className="text-xl font-display font-bold text-white pt-1">
            {modelType === "Local" && (
              <span className="text-indigo-400 font-bold">./my_model/</span>
            )}
            {modelType === "Simulador" && (
              <span className="text-amber-400 font-bold">Simulador Virtual</span>
            )}
            {modelType === "Upload" && (
              <span className="text-emerald-400 font-bold">Modelo Carregado</span>
            )}
          </div>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            {modelType === "Local" && "Carregado de arquivos locais"}
            {modelType === "Simulador" && "Modo de testes sem webcam Real"}
            {modelType === "Upload" && "Carregado via Drag & Drop"}
          </p>
        </div>
        <div className="p-3.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20 z-10">
          <Fingerprint className="h-5.5 w-5.5 animate-pulse" />
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-60"></div>
      </div>

      {/* CARD 3: RECOGNITION QUALITY SENSITIVITY */}
      <div className="glass-effect rounded-2xl p-5 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-zinc-700/80 transition-all">
        <div className="space-y-1.5 z-10 w-full">
          <p className="text-xs text-zinc-400 font-medium tracking-wide">
            FILTRO DE SEGURANÇA
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-display font-bold text-emerald-400">
                {threshold}%
              </span>
              <span className="text-zinc-500 text-xs leading-none">
                Confiança Mínima
              </span>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
              <Award className="h-4.5 w-4.5" />
            </div>
          </div>

          <div className="pt-2 w-full">
            <input
              type="range"
              min="80"
              max="99"
              step="1"
              value={threshold}
              onChange={(e) => onThresholdChange(parseInt(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono pt-1">
              <span>80% Rápido</span>
              <span>95% Seguro</span>
              <span>99% Rigoroso</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-40"></div>
      </div>
    </div>
  );
};
