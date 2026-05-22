import React from "react";
import { Award, User, Sparkles, CheckCircle2 } from "lucide-react";
import { Student } from "../types";

interface DetectionResultCardProps {
  topDetection: { className: string; probability: number } | null;
  students: Student[];
  threshold: number;
}

export const DetectionResultCard: React.FC<DetectionResultCardProps> = ({
  topDetection,
  students,
  threshold,
}) => {
  // Extract info
  const rawName = topDetection?.className || "";
  const probability = topDetection?.probability || 0;
  const confidencePercent = Math.round(probability * 100);

  // Check if high confidence (>= threshold, defaults to 95%)
  const isHighConfidence = confidencePercent >= threshold;

  // Attempt to match rawName with a registered student
  // Examples: rawName is "guilherme" or "Guilherme Franco"
  // Let's find first student whose name contains the rawName as substring, or vice-versa, case-insensitive
  const matchedStudent = rawName
    ? students.find(
        (s) =>
          s.name.toLowerCase().includes(rawName.toLowerCase()) ||
          rawName.toLowerCase().includes(s.name.toLowerCase()) ||
          (rawName.toLowerCase() === "classroom" ? false : false)
      )
    : undefined;

  // Normal human name fallback if no direct student is matched but className is not empty
  const displayName = matchedStudent
    ? matchedStudent.name
    : rawName === "Background" || rawName.toLowerCase() === "background" || rawName.toLowerCase() === "sem pessoa"
    ? "Sem Pessoa Detectada"
    : rawName || "Aguardando Captura...";

  return (
    <div className="space-y-4">
      {/* 2-COLUMN DISPLAY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* PESSOA DETECTADA CARD */}
        <div
          id="pessoa-detectada-card"
          className={`glass-effect rounded-2xl p-5 border shadow-lg transition-all duration-300 relative overflow-hidden group ${
            isHighConfidence
              ? "border-emerald-500/40 bg-emerald-950/20 glow-emerald"
              : "border-zinc-850 bg-[#0a0a0a]"
          }`}
        >
          <div className="space-y-2 z-10 relative">
            <span className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase block">
              Resultados de Rastreio
            </span>
            <h3 className="text-sm font-semibold text-zinc-350 tracking-wide">
              Pessoa Detectada
            </h3>
            <div className="flex items-center gap-2.5 pt-1">
              <div
                className={`p-2 rounded-xl border transition-all ${
                  isHighConfidence
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 animate-pulse"
                    : "bg-[#050505] border-zinc-800 text-zinc-400"
                }`}
              >
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p
                  className={`text-xl font-display font-extrabold leading-tight truncate ${
                    isHighConfidence ? "text-emerald-400" : "text-white"
                  }`}
                >
                  {displayName}
                </p>
                {matchedStudent && (
                  <p className="text-[10px] text-zinc-550 font-mono">
                    RA Vinculado: {matchedStudent.registration}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full blur-2xl opacity-60"></div>
        </div>

        {/* CONFIANÇA CARD */}
        <div
          id="confianca-card"
          className={`glass-effect rounded-2xl p-5 border shadow-lg transition-all duration-300 relative overflow-hidden group ${
            isHighConfidence
              ? "border-emerald-500/40 bg-emerald-950/20 glow-emerald"
              : "border-zinc-850 bg-[#0a0a0a]"
          }`}
        >
          <div className="space-y-2 z-10 relative">
            <span className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase block font-medium">
              Taxa de Verossimilhança
            </span>
            <h3 className="text-sm font-semibold text-zinc-350 tracking-wide">
              Confiança
            </h3>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-3xl font-display font-extrabold ${
                    isHighConfidence ? "text-emerald-400" : "text-white"
                  }`}
                >
                  {confidencePercent}%
                </span>
                <span className="text-zinc-500 text-[10px] font-mono font-medium">match</span>
              </div>

              {/* Progress visual circular bar */}
              <div className="relative h-11 w-11 flex items-center justify-center">
                <svg className="w-11 h-11 transform -rotate-90">
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    strokeWidth="3.5"
                    stroke="rgba(255,255,255,0.03)"
                    fill="transparent"
                  />
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    strokeWidth="3.5"
                    stroke={isHighConfidence ? "#10b981" : "#3b82f6"}
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 18}
                    strokeDashoffset={2 * Math.PI * 18 * (1 - probability)}
                    className="transition-all duration-300"
                  />
                </svg>
                <div
                  className={`absolute text-[10px] font-mono font-bold ${
                    isHighConfidence ? "text-emerald-400" : "text-blue-400"
                  }`}
                >
                  {confidencePercent}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full blur-2xl opacity-60"></div>
        </div>
      </div>

      {/* HIGHLIGHT MESSAGE (VERDE SE > 95%) */}
      {isHighConfidence && displayName !== "Sem Pessoa Detectada" && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl p-3 px-4 text-xs font-semibold flex items-center gap-2.5 animate-pulse">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <div className="flex-1">
            <span>CONFIANÇA ALTA ({confidencePercent}%) - BIOMETRIA FACIAL CONFIRMADA</span>
            <p className="text-[10px] text-emerald-500/80 font-normal font-mono">
              Presença registrada automaticamente no diário de classe.
            </p>
          </div>
        </div>
      )}

      {/* VISÃO DETALHADA DO ALUNO SE HOUVER CASAMENTO */}
      {matchedStudent && (
        <div className="glass-effect rounded-2xl border border-zinc-800 bg-[#0a0a0a] p-5 shadow-lg relative overflow-hidden scale-in">
          <div className="absolute top-0 right-0 px-3 py-1 bg-blue-500/10 text-blue-400 border-l border-b border-zinc-800 rounded-bl-xl text-[9px] font-mono tracking-wider font-semibold">
            FICHA MATRICULADA
          </div>

          <h4 className="text-xs font-semibold text-zinc-400 tracking-wide uppercase mb-3 font-mono">
            Ficha Detalhada do Aluno
          </h4>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center font-display text-2xl font-bold border ${
              isHighConfidence 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                : "bg-zinc-900 border-zinc-800 text-zinc-400"
            }`}>
              {matchedStudent.name.substr(0, 2).toUpperCase()}
            </div>

            <div className="text-center sm:text-left space-y-1 py-1 flex-1">
              <h3 className="text-base font-bold text-white tracking-tight">
                {matchedStudent.name}
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div className="text-left">
                  <span className="text-zinc-500 text-[10px] block font-mono">REGISTRO ALUNO (RA)</span>
                  <span className="text-zinc-350 font-mono font-medium">{matchedStudent.registration}</span>
                </div>
                <div className="text-left">
                  <span className="text-zinc-500 text-[10px] block font-mono">TURMA</span>
                  <span className="text-zinc-350 font-mono font-medium">{matchedStudent.classGroup}</span>
                </div>
                <div className="text-left col-span-2 pt-1 border-t border-zinc-800/80 mt-1">
                  <span className="text-zinc-500 text-[10px] block font-mono">E-MAIL INSTITUCIONAL</span>
                  <span className="text-zinc-400 font-mono text-[11px] truncate block">{matchedStudent.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
