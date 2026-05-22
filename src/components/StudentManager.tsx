import React, { useState } from "react";
import { UserPlus, Search, UserCheck, ShieldClose, Trash2, Mail } from "lucide-react";
import { Student } from "../types";

interface StudentManagerProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, "id">) => void;
  onRemoveStudent: (id: string) => void;
  onManualPresence: (student: Student) => void;
  presentStudentIds: Set<string>;
}

export const StudentManager: React.FC<StudentManagerProps> = ({
  students,
  onAddStudent,
  onRemoveStudent,
  onManualPresence,
  presentStudentIds,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    registration: "",
    classGroup: "3º Ano - Automação",
    email: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.registration) return;
    
    // Automatically fill email if not defined
    const email = newStudent.email || `${newStudent.name.toLowerCase().replace(/\s+/g, ".")}@edu.senai.br`;
    onAddStudent({
      ...newStudent,
      email,
    });
    
    setNewStudent({
      name: "",
      registration: "",
      classGroup: "3º Ano - Automação",
      email: "",
    });
    setShowAddForm(false);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registration.includes(searchTerm) ||
      student.classGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-effect rounded-2xl border border-zinc-800 p-5 shadow-xl h-full flex flex-col bg-[#0a0a0a]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-md font-display font-semibold text-white tracking-tight flex items-center gap-2">
            Relação de Alunos
            <span className="text-xs bg-zinc-800 text-zinc-450 px-2 py-0.5 rounded-full font-mono">
              {students.length}
            </span>
          </h2>
          <p className="text-xs text-zinc-400">Alunos cadastrados no sistema escolar</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold select-none cursor-pointer duration-200 transition-all ${
            showAddForm
              ? "bg-rose-500/10 text-rose-450 border-rose-500/20 hover:bg-rose-500/20"
              : "bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20"
          }`}
        >
          {showAddForm ? (
            <>
              <ShieldClose className="h-4 w-4" /> Cancelar
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" /> Cadastrar Aluno
            </>
          )}
        </button>
      </div>

      {/* FORM: CADASTRO DE NOVO ALUNO */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#050505] p-4 rounded-xl border border-zinc-800/80 space-y-3 mb-4 scale-in"
        >
          <h3 className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">
            REGISTRAR NOVO ALUNO
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-zinc-455 font-medium mb-1 uppercase font-mono">
                Nome do Aluno *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Guilherme Franco"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                className="w-full bg-black border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-550 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-455 font-medium mb-1 uppercase font-mono">
                Matrícula / Código *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 2026501"
                value={newStudent.registration}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, registration: e.target.value })
                }
                className="w-full bg-black border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-550 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-zinc-455 font-medium mb-1 uppercase font-mono">
                Turma / Agrupamento
              </label>
              <select
                value={newStudent.classGroup}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, classGroup: e.target.value })
                }
                className="w-full bg-black border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-550 focus:ring-1 focus:ring-blue-500/20 transition-all cursor-pointer"
              >
                <option value="3º Ano - Automação">3º Ano - Automação</option>
                <option value="3º Ano - Mecatrônica">3º Ano - Mecatrônica</option>
                <option value="1º Ano - TI">1º Ano - TI</option>
                <option value="Professores">Professores</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-455 font-medium mb-1 uppercase font-mono">
                E-mail Institucional (Opcional)
              </label>
              <input
                type="email"
                placeholder="Ex: guilherme.franco@edu.senai.br"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                className="w-full bg-black border border-zinc-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-550 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer bg-[#3b82f6] hover:bg-blue-600 text-white font-semibold py-2 rounded-lg text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1"
          >
            <UserPlus className="h-4 w-4" /> Confirmar Cadastro de Aluno
          </button>
        </form>
      )}

      {/* INPUT DE FILTRAGEM */}
      <div className="relative mb-3.5">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-550">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Pesquisar por nome, matrícula ou turma..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#050505] border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-200 placeholder-zinc-550 focus:outline-none focus:border-zinc-700 transition-all"
        />
      </div>

      {/* LISTA DE ALUNOS */}
      <div className="flex-1 overflow-y-auto max-h-[380px] pr-1.5 space-y-2 scrollbar-thin">
        {filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-zinc-550 border border-dashed border-zinc-800 rounded-xl bg-black/10">
            <Search className="h-8 w-8 mb-2 text-zinc-700" />
            <p className="text-xs">Nenhum aluno localizado</p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const isPresent = presentStudentIds.has(student.id);
            return (
              <div
                key={student.id}
                className="group flex items-center justify-between bg-black/30 hover:bg-[#050505] border border-zinc-850 hover:border-zinc-750 rounded-xl p-3 transition-all"
              >
                {/* INFORMAÇÕES ESCOLARES */}
                <div className="flex items-center gap-3">
                  <div className={`relative flex items-center justify-center h-9 w-9 rounded-full text-xs font-bold ${
                    isPresent 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                  }`}>
                    {student.name.substring(0, 2).toUpperCase()}
                    {isPresent && (
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 border border-[#050505] shadow-sm animate-pulse"></span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors flex items-center gap-2 truncate max-w-[150px] sm:max-w-[180px]">
                      {student.name}
                    </h4>
                    <p className="text-[10px] text-zinc-400 flex items-center gap-1.5 font-mono">
                      <span>RA: {student.registration}</span>
                      <span>•</span>
                      <span className="text-zinc-500 truncate max-w-[80px]">{student.classGroup}</span>
                    </p>
                    {student.email && (
                      <p className="text-[10px] text-zinc-550 truncate max-w-[150px] sm:max-w-[180px] flex items-center gap-1">
                        <Mail className="h-2.5 w-2.5 text-zinc-700" />
                        {student.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* BOTÕES DE INTERAÇÃO */}
                <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                  {isPresent ? (
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-1 font-mono font-semibold flex items-center gap-1">
                      <UserCheck className="h-3 w-3" /> PRESENTE
                    </span>
                  ) : (
                    <button
                      onClick={() => onManualPresence(student)}
                      className="cursor-pointer text-[10px] bg-zinc-900 hover:bg-blue-500/10 text-zinc-300 hover:text-blue-400 border border-zinc-800 hover:border-blue-500/25 rounded-full px-2.5 py-1.5 transition-all font-semibold flex items-center gap-1"
                      title="Registrar chamada manualmente"
                    >
                      Reg. Presença
                    </button>
                  )}

                  {/* Limpar Aluno */}
                  {student.id !== "s1" && student.id !== "s2" && (
                    <button
                      onClick={() => onRemoveStudent(student.id)}
                      className="cursor-pointer text-zinc-550 hover:text-rose-400 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
                      title="Excluir Aluno"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800 text-[10px] text-zinc-500 font-mono flex items-center justify-between">
        <span>Presença Média: {students.length ? Math.round((presentStudentIds.size / students.length) * 100) : 0}%</span>
        <span>Atrasos Permitidos: Até 15min</span>
      </div>
    </div>
  );
};
