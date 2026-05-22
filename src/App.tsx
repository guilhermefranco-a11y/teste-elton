import { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { KPICards } from "./components/KPICards";
import { CameraCard } from "./components/CameraCard";
import { ModelSelector } from "./components/ModelSelector";
import { DetectionResultCard } from "./components/DetectionResultCard";
import { PresenceLogs } from "./components/PresenceLogs";
import { StudentManager } from "./components/StudentManager";
import { Student, PresenceLog, TeachableMachineImageModel } from "./types";
import { UserCheck, ShieldCheck, Activity } from "lucide-react";

// Lista inicial padrão de alunos para controle de presença
const INITIAL_STUDENTS: Student[] = [
  {
    id: "s1",
    name: "Guilherme Franco",
    registration: "220412",
    classGroup: "3º Ano - Automação",
    email: "guilherme.franco@edu.senai.br",
  },
  {
    id: "s2",
    name: "Beatriz Pinheiro",
    registration: "220415",
    classGroup: "3º Ano - Automação",
    email: "beatriz.pinheiro@edu.senai.br",
  },
  {
    id: "s3",
    name: "Gustavo Santos",
    registration: "220459",
    classGroup: "3º Ano - Automação",
    email: "gustavo.santos@edu.senai.br",
  },
  {
    id: "s4",
    name: "Alisson Silva",
    registration: "220490",
    classGroup: "1º Ano - TI",
    email: "alisson.silva@edu.senai.br",
  },
  {
    id: "s5",
    name: "Prof. Ricardo",
    registration: "100201",
    classGroup: "Professores",
    email: "ricardo.prof@edu.senai.br",
  },
];

export default function App() {
  // --- ESTADOS DO SISTEMA ---
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem("sentrycam_students");
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [presenceLogs, setPresenceLogs] = useState<PresenceLog[]>(() => {
    const saved = localStorage.getItem("sentrycam_presence_logs");
    return saved ? JSON.parse(saved) : [];
  });

  const [threshold, setThreshold] = useState<number>(() => {
    const saved = localStorage.getItem("sentrycam_threshold");
    return saved ? parseInt(saved) : 95;
  });

  // Estados de IA e Modelos
  const [modelType, setModelType] = useState<"Local" | "Simulador" | "Upload">("Local");
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Estados de Transmissão da Câmera
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  // Controle de predições ativas
  const [topDetection, setTopDetection] = useState<{ className: string; probability: number } | null>(null);

  // --- REFERÊNCIAS ---
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const modelRef = useRef<TeachableMachineImageModel | null>(null);

  // --- PERSISTÊNCIA EM LOCAL STORAGE ---
  useEffect(() => {
    localStorage.setItem("sentrycam_students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("sentrycam_presence_logs", JSON.stringify(presenceLogs));
  }, [presenceLogs]);

  useEffect(() => {
    localStorage.setItem("sentrycam_threshold", threshold.toString());
  }, [threshold]);

  // --- CARREGAMENTO DE ENTRADAS DE DEVICELIST DA CAMERA ---
  useEffect(() => {
    const checkCameras = async () => {
      try {
        // Solicita acesso inicial da webcam apenas para listar drivers de hardware legíveis
        await navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            stream.getTracks().forEach((track) => track.stop());
          })
          .catch(() => {});

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((device) => device.kind === "videoinput");
        setCameraDevices(videoInputs);

        if (videoInputs.length > 0) {
          setSelectedDeviceId((prev) => prev || videoInputs[0].deviceId);
        }
      } catch (err) {
        console.warn("Dispositivos de câmera não localizados ou bloqueados:", err);
      }
    };

    checkCameras();
  }, []);

  // --- CONTROLLER CARREGADOR DE MODELO LOCAL ---
  const loadLocalModel = async () => {
    if (!window.tmImage) {
      setModelError("As bibliotecas do Teachable Machine não estão prontas no escopo da janela.");
      return;
    }

    try {
      setModelLoading(true);
      setModelError(null);
      setIsSimulating(false);

      // Pastas padrão conforme requisito: ./my_model/
      const modelURL = "./my_model/model.json";
      const metadataURL = "./my_model/metadata.json";

      // Chamada do TensorFlow.js Teachable Machine SDK
      const loadedModel = await window.tmImage.load(modelURL, metadataURL);
      modelRef.current = loadedModel;

      setModelLoaded(true);
      setModelType("Local");
      console.log("Teachable Machine: Modelo carregado com sucesso da pasta local ./my_model/!");
    } catch (err: any) {
      console.warn("Nenhum modelo do Teachable Machine encontrado na pasta ./my_model/:", err);
      setModelLoaded(false);
      setModelError(
        "Não foi possível localizar o modelo na pasta local './my_model/model.json' (404 ou formato inválido). Para testar, utilize o Upload Manual ou o Simulador Virtual."
      );
      // Fallback automático para simulação inteligente para garantir interface verde-esmeralda operável
      setIsSimulating(true);
      setModelType("Simulador");
    } finally {
      setModelLoading(false);
    }
  };

  // --- CARREGA SE SCRIPTS ATIVOS DO CDN COM POLLING ---
  useEffect(() => {
    let checkAttempts = 0;
    const interval = setInterval(() => {
      checkAttempts++;
      if (window.tmImage && window.tf) {
        clearInterval(interval);
        loadLocalModel();
      } else if (checkAttempts > 15) {
        // Se após 7.5 segundos os CDNs falharem (sem conexão)
        clearInterval(interval);
        setModelError("Tempo esgotado para puxar as bibliotecas do Google TensorFlow via CDN.");
        setIsSimulating(true);
        setModelType("Simulador");
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // --- LÓGICA DO WEBCAM STREAM ---
  const startCamera = async (deviceIdToUse = selectedDeviceId) => {
    try {
      setCameraLoading(true);

      // Desliga streams ativos anteriormente para limpar o pipeline
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: deviceIdToUse
          ? { deviceId: { exact: deviceIdToUse }, width: { ideal: 640 }, height: { ideal: 480 } }
          : { width: { ideal: 640 }, height: { ideal: 480 } },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setVideoStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Garante processamento de reprodução
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            ?.play()
            .then(() => setCameraActive(true))
            .catch((e) => console.log("Video auto play bypass:", e));
        };
      }
    } catch (err: any) {
      console.error("Falha ao ligar a webcam física:", err);
      alert("Erro ao abrir a câmera: " + err.message + "\nPor favor, garanta permissões de hardware no navegador.");
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setVideoStream(null);
    setCameraActive(false);
    setTopDetection(null);
  };

  // --- DISPARA ABERTURA DA CÂMERA AUTOMATICAMENTE ---
  // Abre o dispositivo na inicialização assim que os drivers de câmeras são computados
  useEffect(() => {
    if (selectedDeviceId && !cameraActive && !cameraLoading) {
      startCamera(selectedDeviceId);
    }
  }, [selectedDeviceId]);

  // Limpa conexões de câmera no desmonte do componente React
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoStream]);

  // --- REGISTRADOR DE PRESENÇAS E EVITADOR DE SPAM ---
  const registerPresence = (student: Student, confidenceScore: number, method: "Facial" | "Manual") => {
    // Verificação de segurança: Alunos já registrados na aula atual não duplicam
    const isPresent = presenceLogs.some((log) => log.studentId === student.id);
    if (isPresent) return;

    const newLog: PresenceLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      studentId: student.id,
      studentName: student.name,
      registration: student.registration,
      classGroup: student.classGroup,
      timestamp: new Date().toISOString(),
      confidence: confidenceScore,
      status: "Presente",
      method: method,
    };

    setPresenceLogs((prev) => [newLog, ...prev]);
  };

  // --- PIPELINE OPERACIONAL REAL: PROCESSAMENTO DE FRAMES TENSORFLOW ---
  useEffect(() => {
    let isMounted = true;
    let animFrameId: number;

    const processFrame = async () => {
      if (
        !cameraActive ||
        !modelLoaded ||
        isSimulating ||
        !videoRef.current ||
        !modelRef.current
      ) {
        return;
      }

      try {
        // Classifica o frame atual obtido da webcam
        const predictions = await modelRef.current.predict(videoRef.current);

        if (predictions && predictions.length > 0 && isMounted) {
          // Ordena decrescentemente para capturar a classe dominante de maior probabilidade
          const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
          const top = sorted[0];

          setTopDetection(top);

          // Se a precisão atingiu o limiar de corte exigido (ex: 95%)
          const confidencePercent = Math.round(top.probability * 100);
          if (confidencePercent >= threshold) {
            // Se for background ou vazio, ignoramos
            const isNoPerson =
              top.className.toLowerCase() === "background" ||
              top.className.toLowerCase() === "sem pessoa" ||
              top.className.toLowerCase() === "vazio";

            if (!isNoPerson) {
              // Tenta localizar o aluno para acoplar o registro
              const matched = students.find(
                (s) =>
                  s.name.toLowerCase().includes(top.className.toLowerCase()) ||
                  top.className.toLowerCase().includes(s.name.toLowerCase())
              );

              if (matched) {
                registerPresence(matched, confidencePercent, "Facial");
              }
            }
          }
        }
      } catch (err) {
        console.error("Erro na inferência biométrica:", err);
      }

      // Agenda o próximo frame se o sistema continuar ativo
      if (isMounted && cameraActive && modelLoaded) {
        animFrameId = requestAnimationFrame(processFrame);
      }
    };

    if (cameraActive && modelLoaded && !isSimulating) {
      processFrame();
    } else {
      setTopDetection(null);
    }

    return () => {
      isMounted = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [cameraActive, modelLoaded, isSimulating, threshold, students, presenceLogs]);

  // --- PIPELINE DE SIMULAÇÃO INTELIGENTE (Quando sem modelo do Teachable Machine) ---
  useEffect(() => {
    let simulationTimer: NodeJS.Timeout;

    if (cameraActive && isSimulating) {
      const triggerSimulatedDetection = () => {
        // 10% de chance de simular o fundo vazio (Background / Sem pessoa)
        const isBg = Math.random() < 0.12;

        if (isBg) {
          setTopDetection({ className: "Sem Pessoa", probability: 0.88 });
        } else {
          // Seleciona um aluno randômico da base cadastrada para simular detecção facial
          const randomStudent = students[Math.floor(Math.random() * students.length)];
          // Força precisão flutuando entre 92% e 99% para testar comportamento verde a partir de 95%!
          const calculatedConfidence = 0.92 + Math.random() * 0.075;

          setTopDetection({
            className: randomStudent.name,
            probability: calculatedConfidence,
          });

          // Se o sorteador disparar uma probabilidade maior/igual ao threshold, marca presença!
          const parsedPercent = Math.round(calculatedConfidence * 100);
          if (parsedPercent >= threshold) {
            registerPresence(randomStudent, parsedPercent, "Facial");
          }
        }

        // Repete o ciclo simulado a cada 6 segundos
        simulationTimer = setTimeout(triggerSimulatedDetection, 6000);
      };

      // Inicia a primeira varredura após 2 segundos
      simulationTimer = setTimeout(triggerSimulatedDetection, 2000);
    } else {
      setTopDetection(null);
    }

    return () => {
      if (simulationTimer) clearTimeout(simulationTimer);
    };
  }, [cameraActive, isSimulating, students, presenceLogs, threshold]);

  // --- MÉTODOS DE CALLBACKS DO CURRICULO/GESTÃO ---
  const handleAddStudent = (newStudentData: Omit<Student, "id">) => {
    const studentWithId: Student = {
      ...newStudentData,
      id: `std_${Date.now()}`,
    };
    setStudents((prev) => [...prev, studentWithId]);
  };

  const handleRemoveStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    // Remove os logs do aluno para manter integridade
    setPresenceLogs((prev) => prev.filter((log) => log.studentId !== id));
  };

  const handleManualPresence = (student: Student) => {
    registerPresence(student, 100, "Manual");
  };

  // Carregamento de arquivos do Teachable Machine arrastados no painel
  const handleLoadFromFiles = async (
    modelJson: File,
    weightsBin: File,
    metadataJson: File
  ) => {
    if (!window.tmImage) throw new Error("Teachable Machine no-window");
    const loadedModel = await window.tmImage.loadFromFiles(
      modelJson,
      weightsBin,
      metadataJson
    );
    modelRef.current = loadedModel;
    setModelLoaded(true);
    setIsSimulating(false);
    setModelType("Upload");
  };

  // Carregamento de link da nuvem Teachable Machine
  const handleLoadFromUrl = async (url: string) => {
    if (!window.tmImage) throw new Error("Teachable Machine no-window");
    const modelURL = url + "model.json";
    const metadataURL = url + "metadata.json";
    const loadedModel = await window.tmImage.load(modelURL, metadataURL);
    modelRef.current = loadedModel;
    setModelLoaded(true);
    setIsSimulating(false);
    setModelType("Upload");
  };

  // Extrai IDs de alunos presentes
  const presentStudentIds = new Set(presenceLogs.map((log) => log.studentId));

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans flex flex-col selection:bg-blue-600 selection:text-white pb-12">
      {/* 1. TOPO E RELÓGIO */}
      <Header
        modelLoaded={modelLoaded}
        isSimulating={isSimulating}
        onReloadModel={loadLocalModel}
      />

      <main className="max-w-7xl w-full mx-auto px-4 md:px-6 mt-6 space-y-6 flex-1">
        {/* 2. KPI E METAS */}
        <KPICards
          presentCount={presentStudentIds.size}
          totalCount={students.length}
          modelType={modelType}
          threshold={threshold}
          onThresholdChange={setThreshold}
        />

        {/* 3. GRID DA ÁREA DE TRABALHO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LADO ESQUERDO: CONTROLES DE IMAGEM & INICIALIZADOR */}
          <section className="lg:col-span-7 space-y-6 flex flex-col">
            {/* CÂMERA DE CAPTURA */}
            <CameraCard
              cameraActive={cameraActive}
              cameraLoading={cameraLoading}
              onStartCamera={() => startCamera()}
              onStopCamera={stopCamera}
              videoRef={videoRef}
              cameraDevices={cameraDevices}
              selectedDeviceId={selectedDeviceId}
              onDeviceChange={(id) => {
                setSelectedDeviceId(id);
                if (cameraActive) startCamera(id);
              }}
              modelLoaded={modelLoaded}
              isSimulating={isSimulating}
            />

            {/* SELECIONADOR DE MODELOS E UPLOAD */}
            <ModelSelector
              modelLoaded={modelLoaded}
              modelLoading={modelLoading}
              modelError={modelError}
              onLoadLocalModel={loadLocalModel}
              onLoadFromFiles={handleLoadFromFiles}
              onLoadFromUrl={handleLoadFromUrl}
              isSimulating={isSimulating}
              onToggleSimulation={(val) => {
                setIsSimulating(val);
                setModelType(val ? "Simulador" : modelLoaded ? "Local" : "Simulador");
              }}
            />
          </section>

          {/* LADO DIREITO: PESSOA DETECTADA, CONFIANÇA E RELAÇÃO DE ALUNOS */}
          <section className="lg:col-span-5 space-y-6">
            
            {/* ÁREA GOURMET DOS REQUISITOS: PESSOA DETECTADA / CONFIANÇA */}
            <DetectionResultCard
              topDetection={topDetection}
              students={students}
              threshold={threshold}
            />

            {/* GESTÃO E LISTAGEM DE ALUNOS */}
            <StudentManager
              students={students}
              onAddStudent={handleAddStudent}
              onRemoveStudent={handleRemoveStudent}
              onManualPresence={handleManualPresence}
              presentStudentIds={presentStudentIds}
            />
          </section>
        </div>

        {/* 4. DIÁRIO DE PRESENÇA CRONOLÓGICO */}
        <section id="presence-logs-section">
          <PresenceLogs
            logs={presenceLogs}
            onClearLogs={() => setPresenceLogs([])}
          />
        </section>
      </main>
    </div>
  );
}
