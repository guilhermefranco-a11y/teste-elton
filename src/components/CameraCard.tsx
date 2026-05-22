import React from "react";
import { Camera, CameraOff, Monitor, Settings, RefreshCw } from "lucide-react";

interface CameraCardProps {
  cameraActive: boolean;
  cameraLoading: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraDevices: MediaDeviceInfo[];
  selectedDeviceId: string;
  onDeviceChange: (id: string) => void;
  modelLoaded: boolean;
  isSimulating: boolean;
}

export const CameraCard: React.FC<CameraCardProps> = ({
  cameraActive,
  cameraLoading,
  onStartCamera,
  onStopCamera,
  videoRef,
  cameraDevices,
  selectedDeviceId,
  onDeviceChange,
  modelLoaded,
  isSimulating,
}) => {
  return (
    <div className="glass-effect rounded-2xl border border-zinc-800 p-5 shadow-xl flex flex-col h-full bg-[#0a0a0a]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-md font-display font-semibold text-white tracking-tight flex items-center gap-2">
            Dispostivo de Captura
            {cameraActive && (
              <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 block animate-pulse"></span>
                TRANSMISSÃO AO VIVO
              </span>
            )}
          </h2>
          <p className="text-xs text-zinc-400">Webcam ativa para identificação biométrica</p>
        </div>

        {/* CONTROLES DE CÂMERA */}
        <div className="flex items-center gap-2">
          {cameraActive ? (
            <button
              onClick={onStopCamera}
              className="cursor-pointer flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold py-1.5 px-4 rounded-xl text-xs duration-200 transition-all shadow-lg"
            >
              <CameraOff className="h-4 w-4" /> Desligar
            </button>
          ) : (
            <button
              onClick={onStartCamera}
              disabled={cameraLoading}
              className="cursor-pointer flex items-center gap-1.5 bg-[#3b82f6] hover:bg-blue-600 active:scale-95 disabled:opacity-50 text-white font-semibold py-1.5 px-4 rounded-xl text-xs duration-200 transition-all shadow-lg shadow-blue-950/25"
            >
              {cameraLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Conectando...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" /> Iniciar Câmera
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ÁREA DE RENDERIZAÇÃO DO VÍDEO (HUDS / SCANNER) */}
      <div className="relative aspect-video w-full rounded-2xl bg-[#050505] overflow-hidden border border-zinc-800 shadow-inner flex items-center justify-center">
        {/* CORNER TARGETS (HUD BIO) */}
        {cameraActive && (
          <>
            {/* Sup esq */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-blue-500/80 z-20"></div>
            {/* Sup dir */}
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-blue-500/80 z-20"></div>
            {/* Inf esq */}
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-blue-500/80 z-20"></div>
            {/* Inf dir */}
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-500/80 z-20"></div>

            {/* SCANNING LINE EFFECT */}
            <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_15px_#3b82f6] opacity-70 animate-scan-line z-15"></div>

            {/* WATERMARK LABELS */}
            <div className="absolute bottom-4 left-4 bg-black/75 border border-zinc-800 text-[9px] text-blue-450 font-mono px-2 py-1 rounded-md tracking-wider flex items-center gap-1.5 z-20 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 bg-blue-550 rounded-full inline-block animate-ping"></span>
              SENTRY_HUD_CHAMADA: PRONTO
            </div>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 border border-zinc-800 text-[9px] text-zinc-400 font-mono px-3 py-1 rounded-full tracking-wider z-20 backdrop-blur-sm">
              MIRA DE RECONHECIMENTO FACIAL
            </div>
          </>
        )}

        {/* FEED REAL DO WEBCAM */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover transform scale-x-[-1] ${
            cameraActive ? "block" : "hidden"
          }`}
        ></video>

        {/* TELA DE ESPERA */}
        {!cameraActive && (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-500">
              <Camera className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-300">
                Transmissão Biométrica Desligada
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mt-1">
                Ligue a câmera usando o botão no topo para iniciar o monitoramento
                facial automático e capturar frames.
              </p>
            </div>
            <button
              onClick={onStartCamera}
              className="cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-750 font-semibold py-1.5 px-4 rounded-xl text-xs transition-all active:scale-95"
            >
              Ligar Câmera Agora
            </button>
          </div>
        )}
      </div>

      {/* SELECIONADOR DE WEBCAMS EM DISPOSITIVOS COM MÚLTIPLAS CÂMERAS */}
      <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-zinc-400">
        <div className="flex items-center gap-2 text-xs">
          <Settings className="h-3.5 w-3.5 text-zinc-550" />
          <span>Configurações do Sensor</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Monitor className="h-3.5 w-3.5 text-zinc-550" />
          <select
            value={selectedDeviceId}
            disabled={cameraDevices.length === 0}
            onChange={(e) => onDeviceChange(e.target.value)}
            className="bg-[#050505] border border-zinc-800 rounded-lg py-1 px-2.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 w-full sm:w-56 cursor-pointer"
          >
            {cameraDevices.length === 0 ? (
              <option value="">Nenhuma câmera localizada</option>
            ) : (
              cameraDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Câmera ${device.deviceId.substring(0, 5)}...`}
                </option>
              ))
            )}
          </select>
        </div>
      </div>
    </div>
  );
};
