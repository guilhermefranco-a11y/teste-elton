import React, { useState, useRef } from "react";
import { FolderOpen, Upload, Link2, AlertTriangle, CheckCircle, HelpCircle, Laptop, RefreshCw } from "lucide-react";

interface ModelSelectorProps {
  modelLoaded: boolean;
  modelLoading: boolean;
  modelError: string | null;
  onLoadLocalModel: () => void;
  onLoadFromFiles: (modelJson: File, weightsBin: File, metadataJson: File) => Promise<void>;
  onLoadFromUrl: (url: string) => Promise<void>;
  isSimulating: boolean;
  onToggleSimulation: (val: boolean) => void;
}

type TabType = "local" | "upload" | "url" | "simulate";

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  modelLoaded,
  modelLoading,
  modelError,
  onLoadLocalModel,
  onLoadFromFiles,
  onLoadFromUrl,
  isSimulating,
  onToggleSimulation,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("local");
  const [modelUrl, setModelUrl] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Files state
  const [selectedFiles, setSelectedFiles] = useState<{
    modelJson?: File;
    weightsBin?: File;
    metadataJson?: File;
  }>({});
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files) as File[];
    
    const modelJson = filesArray.find((f) => f.name === "model.json");
    const weightsBin = filesArray.find((f) => f.name === "weights.bin");
    const metadataJson = filesArray.find((f) => f.name === "metadata.json");

    setSelectedFiles({
      modelJson,
      weightsBin,
      metadataJson,
    });

    setFileError(null);
  };

  const processUploadedFiles = async () => {
    const { modelJson, weightsBin, metadataJson } = selectedFiles;
    if (!modelJson || !weightsBin || !metadataJson) {
      setFileError("Você deve carregar os 3 arquivos necessários: model.json, weights.bin e metadata.json.");
      return;
    }

    try {
      setFileLoading(true);
      setFileError(null);
      await onLoadFromFiles(modelJson, weightsBin, metadataJson);
      setActiveTab("upload"); // Keep in tab on success
    } catch (err: any) {
      setFileError(err.message || "Erro ao instanciar os arquivos de IA.");
    } finally {
      setFileLoading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelUrl) return;

    let formattedUrl = modelUrl.trim();
    if (!formattedUrl.endsWith("/")) {
      formattedUrl += "/";
    }

    try {
      setUrlLoading(true);
      setUrlError(null);
      await onLoadFromUrl(formattedUrl);
    } catch (err: any) {
      setUrlError("Falha ao baixar modelo do link Teachable Machine.");
    } finally {
      setUrlLoading(false);
    }
  };

  return (
    <div className="glass-effect rounded-2xl border border-zinc-800 p-5 shadow-xl bg-[#0a0a0a]">
      <div className="mb-4">
        <h3 className="text-sm font-display font-semibold text-white tracking-tight flex items-center gap-1.5">
          <Laptop className="h-4.5 w-4.5 text-blue-450" />
          Configuração de Inicialização de IA
        </h3>
        <p className="text-xs text-zinc-400">Gerenciar fonte e arquivos do modelo neural TensorFlow.js</p>
      </div>

      {/* TABS SELECTORS */}
      <div className="grid grid-cols-4 bg-black/50 p-1.5 rounded-xl border border-zinc-800/85 text-xs mb-4">
        {(
          [
            { id: "local", name: "Pasta Local" },
            { id: "upload", name: "Upload Manual" },
            { id: "url", name: "Link TM" },
            { id: "simulate", name: "Simulador" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`cursor-pointer py-1.5 rounded-lg text-center font-medium transition-all ${
              activeTab === tab.id
                ? "bg-zinc-800 text-white shadow-sm font-semibold border border-zinc-700/45"
                : "text-zinc-450 hover:text-zinc-250"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* CONTAINER ACTIVE TAB */}
      <div className="space-y-4">
        {/* TAB 1: LOCAL BUNDLE DIRECTORY */}
        {activeTab === "local" && (
          <div className="space-y-3.5">
            <div className="bg-[#050505] border border-zinc-800/80 p-3.5 rounded-xl flex items-start gap-3">
              <FolderOpen className="h-5 w-5 text-blue-450 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <h4 className="font-semibold text-zinc-200 font-mono">Pasta Alvo: ./my_model/</h4>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  O sistema tenta autocarregar o modelo a partir da pasta padrão do sistema na
                  inicialização. Os arquivos requeridos são:
                </p>
                <ul className="list-disc pl-4 text-zinc-550 font-mono text-[10px] space-y-0.5 pt-1">
                  <li>model.json</li>
                  <li>metadata.json</li>
                  <li>weights.bin</li>
                </ul>
              </div>
            </div>

            {/* STATUS DISPLAY */}
            {modelLoaded && !isSimulating ? (
              <div className="bg-emerald-500/10 border border-emerald-500/25 p-3.5 rounded-xl flex gap-3 items-center text-emerald-400 text-xs">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-bold">Modelo Local Ativo!</p>
                  <p className="text-[10px] text-emerald-500 font-medium">Reconhecimento facial operando de forma 100% offline.</p>
                </div>
              </div>
            ) : modelLoading ? (
              <div className="bg-[#050505] border border-zinc-800 p-4 rounded-xl flex items-center justify-center gap-3 text-zinc-300 text-xs py-6">
                <RefreshCw className="h-5 w-5 animate-spin text-blue-400" />
                <span>Buscando modelo em ./my_model/...</span>
              </div>
            ) : (
              <div className="bg-amber-500/5 border border-amber-500/15 p-3.5 rounded-xl space-y-2">
                <div className="flex gap-2.5 items-start text-amber-500 text-xs">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-400">Modelo Local ausente em ./my_model/</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                      Caso ainda não tenha inserido o modelo exportado na pasta do sistema, você pode
                      utilizar os painéis acima para **Fazer Upload Manual** dos arquivos no navegador ou
                      ativar o **Simulador Virtual** para demonstrações.
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex justify-between gap-2.5">
                  <button
                    onClick={onLoadLocalModel}
                    className="cursor-pointer bg-[#050505] hover:bg-[#111] text-zinc-350 border border-zinc-800 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all"
                  >
                    Tentar Novamente
                  </button>
                  <button
                    onClick={() => {
                      onToggleSimulation(true);
                      setActiveTab("simulate");
                    }}
                    className="cursor-pointer bg-[#3b82f6] text-white px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-blue-600 transition-all font-sans"
                  >
                    LIGAR SIMULADOR RAPIDAMENTE
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MANUAL FILES UPLOAD */}
        {activeTab === "upload" && (
          <div className="space-y-3.5 scale-in">
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Clique para selecionar ou arraste os **três arquivos** exportados do Teachable Machine (Image Project) diretamente para o navegador:
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-800 hover:border-blue-500/40 bg-black/30 hover:bg-[#050505]/40 p-5 rounded-xl text-center cursor-pointer transition-all space-y-2.5 group"
            >
              <Upload className="h-6 w-6 text-zinc-650 group-hover:text-blue-500 mx-auto transition-colors" />
              <div className="text-xs">
                <span className="text-blue-400 font-semibold">Selecione os arquivos</span>
                <span className="text-zinc-500"> ou arraste-os aqui</span>
              </div>
              <p className="text-[9px] text-zinc-550 font-mono">
                model.json, weights.bin, metadata.json (Exportados como tfjs)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".json,.bin"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* SELEÇÃO ATUAL */}
            {(selectedFiles.modelJson || selectedFiles.metadataJson || selectedFiles.weightsBin) && (
              <div className="bg-[#050505] border border-zinc-850 rounded-xl p-3 space-y-2 text-[11px]">
                <p className="font-medium text-zinc-400 uppercase tracking-wider text-[10px] font-mono">Arquivos Carregados:</p>
                <div className="space-y-1 font-mono text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">model.json:</span>
                    <span className={selectedFiles.modelJson ? "text-emerald-400 font-bold" : "text-rose-500"}>
                      {selectedFiles.modelJson ? "Carregado ✓" : "Ausente ×"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">weights.bin:</span>
                    <span className={selectedFiles.weightsBin ? "text-emerald-400 font-bold" : "text-rose-500"}>
                      {selectedFiles.weightsBin ? "Carregado ✓" : "Ausente ×"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">metadata.json:</span>
                    <span className={selectedFiles.metadataJson ? "text-emerald-400 font-bold" : "text-rose-500"}>
                      {selectedFiles.metadataJson ? "Carregado ✓" : "Ausente ×"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={processUploadedFiles}
                  disabled={fileLoading || !selectedFiles.modelJson || !selectedFiles.weightsBin || !selectedFiles.metadataJson}
                  className="w-full mt-2 cursor-pointer bg-[#3b82f6] disabled:opacity-50 text-white font-bold py-1.5 rounded-lg text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-1.5"
                >
                  {fileLoading ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Instanciar Modelo na IA"
                  )}
                </button>
              </div>
            )}

            {fileError && (
              <div className="text-[11px] text-rose-450 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}
            {modelLoaded && activeTab === "upload" && (
              <div className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>Modelo Customizado Instanciado com sucesso!</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MODEL FROM INTERNET URL */}
        {activeTab === "url" && (
          <form onSubmit={handleUrlSubmit} className="space-y-3.5 scale-in">
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Você pode carregar o modelo colando o link público gerado na plataforma Teachable Machine Cloud da Google:
            </p>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-650">
                <Link2 className="h-4 w-4" />
              </span>
              <input
                type="url"
                required
                placeholder="Ex: https://teachablemachine.withgoogle.com/models/oF4fQpEXC/"
                value={modelUrl}
                onChange={(e) => setModelUrl(e.target.value)}
                className="w-full bg-black border border-zinc-850 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={urlLoading}
              className="w-full cursor-pointer bg-[#3b82f6] text-white font-bold py-2 rounded-xl text-xs hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              {urlLoading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Conectando e baixando...
                </>
              ) : (
                "Carregar link externo"
              )}
            </button>

            {urlError && (
              <div className="text-[11px] text-rose-500 bg-rose-500/10 border border-rose-500/15 p-2.5 rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{urlError}</span>
              </div>
            )}
            {modelLoaded && activeTab === "url" && (
              <div className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 p-2.5 rounded-lg flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>Modelo Web ativado e sincronizado!</span>
              </div>
            )}
          </form>
        )}

        {/* TAB 4: VIRTUAL SIMULATOR */}
        {activeTab === "simulate" && (
          <div className="space-y-3.5 scale-in">
            <div className="bg-[#050505] border border-zinc-800 p-3 rounded-lg flex items-start gap-3 text-xs">
              <HelpCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-zinc-300">Sobre o Simulador Escolar</p>
                <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                  O simulador permite demonstrar o sistema perfeitamente sem carregar arquivos. Ele simula
                  reconhecimentos em intervalos periódicos quando a webcam está ligada.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-zinc-800/80">
              <span className="text-xs text-zinc-300 font-medium">Estado do Simulador:</span>
              <button
                type="button"
                onClick={() => onToggleSimulation(!isSimulating)}
                className={`cursor-pointer text-xs font-bold px-3 py-1.5 rounded-lg select-none duration-250 transition-all ${
                  isSimulating
                    ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-300 border border-zinc-800"
                }`}
              >
                {isSimulating ? "ATIVADO (SIMULAR)" : "DESATIVADO"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
