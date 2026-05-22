import React from "react";
import { Download, Trash2, CalendarDays, Clock, FileSpreadsheet, ShieldCheck } from "lucide-react";
import { PresenceLog } from "../types";

interface PresenceLogsProps {
  logs: PresenceLog[];
  onClearLogs: () => void;
}

export const PresenceLogs: React.FC<PresenceLogsProps> = ({ logs, onClearLogs }) => {
  // Exporter function for CSV spreadsheets
  const handleExportCSV = () => {
    if (logs.length === 0) return;

    // Headers config
    const headers = ["ID Registro", "Nome do Aluno", "RA / Matricula", "Turma", "Data e Hora", "Confianca (%)", "Status do Aluno", "Metodo"];
    
    // Rows building
    const rows = logs.map((log) => [
      log.id,
      log.studentName,
      log.registration,
      log.classGroup,
      new Date(log.timestamp).toLocaleString("pt-BR"),
      `${log.confidence}%`,
      log.status,
      log.method,
    ]);

    // Build standard CSV content string UTF-8 compatible
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + // BOM indicator for excel compatibility
      [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    // Dynamic naming
    const today = new Date().toISOString().substring(0, 10);
    link.setAttribute("download", `presenca_biometrica_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-effect rounded-2xl border border-zinc-800 p-5 shadow-xl bg-[#0a0a0a]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-md font-display font-semibold text-white tracking-tight flex items-center gap-2">
            Diário de Presença Digital
            <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-mono">
              {logs.length} Registros
            </span>
          </h2>
          <p className="text-xs text-zinc-400 font-sans">
            Log cronológico das confirmações biométricas faciais
          </p>
        </div>

        {/* LOG PANEL ACTIONS */}
        <div className="flex gap-2">
          {logs.length > 0 && (
            <>
              <button
                onClick={handleExportCSV}
                className="cursor-pointer flex items-center gap-1 bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 rounded-lg px-3.5 py-1.5 text-xs font-semibold select-none duration-200 transition-all font-mono"
              >
                <Download className="h-3.5 w-3.5" /> CSV / Planilha
              </button>

              <button
                onClick={onClearLogs}
                className="cursor-pointer flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 hover:border-transparent rounded-lg px-3 py-1.5 text-xs font-semibold select-none duration-200 transition-all"
                title="Limpar todos os logs"
              >
                <Trash2 className="h-3.5 w-3.5" /> Limpar Histórico
              </button>
            </>
          )}
        </div>
      </div>

      {/* RENDER TABLE OF LOGS */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-[#050505]/60 max-h-[300px] overflow-y-auto scrollbar-thin">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-center">
            <FileSpreadsheet className="h-10 w-10 mb-2.5 text-zinc-700" />
            <span className="text-xs font-semibold text-zinc-400">Nenhuma chamada confirmada</span>
            <p className="text-[11px] text-zinc-500 max-w-xs mt-1">
              Os registros de presença aparecerão aqui conforme as pessoas forem detectadas pela webcam com alta confiança.
            </p>
          </div>
        ) : (
          <table className="w-full text-xs text-left text-zinc-350">
            <thead className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 border-b border-zinc-800/80 bg-[#0a0a0a]/80 sticky top-0">
              <tr>
                <th className="px-4 py-3">Aluno</th>
                <th className="px-4 py-3">RA / Matrícula</th>
                <th className="px-4 py-3">Turma</th>
                <th className="px-4 py-3">Data e Hora</th>
                <th className="px-4 py-3 text-center">Precisão</th>
                <th className="px-4 py-3 text-center">Método</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 pb-2">
              {logs.map((log) => {
                const dateObj = new Date(log.timestamp);
                const timeString = dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                const dateString = dateObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

                return (
                  <tr key={log.id} className="hover:bg-zinc-900/35 transition-colors">
                    {/* Aluno */}
                    <td className="px-4 py-3 font-semibold text-white">
                      {log.studentName}
                    </td>

                    {/* RA */}
                    <td className="px-4 py-3 font-mono text-zinc-450">
                      {log.registration}
                    </td>

                    {/* Turma */}
                    <td className="px-4 py-3 text-zinc-450">
                      {log.classGroup}
                    </td>

                    {/* Timestamp */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Clock className="h-3 w-3 text-zinc-500" />
                        <span className="font-mono text-[11px]">{timeString}</span>
                        <span className="text-zinc-700">•</span>
                        <span className="text-zinc-500 text-[10px]">{dateString}</span>
                      </div>
                    </td>

                    {/* Precisão */}
                    <td className="px-4 py-3 text-center">
                      <span className="text-emerald-450 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md text-[10px] border border-emerald-500/15">
                        {log.confidence}%
                      </span>
                    </td>

                    {/* Método */}
                    <td className="px-4 py-3 text-center font-mono text-[10px]">
                      {log.method === "Facial" ? (
                        <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/15">
                          BIOMETRIA
                        </span>
                      ) : (
                        <span className="text-zinc-450 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                          MANUAL
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        <ShieldCheck className="h-3 w-3" /> PRESENTE
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {logs.length > 0 && (
        <div className="mt-3 text-[10.5px] text-zinc-500 font-mono flex items-center justify-between">
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Última atualização: {new Date().toLocaleTimeString("pt-BR")}</span>
          </div>
          <span>Sincronizado localmente</span>
        </div>
      )}
    </div>
  );
};
