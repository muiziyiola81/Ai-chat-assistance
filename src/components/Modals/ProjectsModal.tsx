import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FolderKanban,
  Plus,
  Trash2,
  Edit2,
  Check,
  FolderOpen,
} from 'lucide-react';
import { Project } from '../../types';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activeProjectId?: string;
  onSelectProject: (id?: string) => void;
  onCreateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onUpdateProject,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editInstructions, setEditInstructions] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Custom Project Workspace',
      instructions: instructions.trim(),
      createdAt: Date.now(),
      color: '#10b981',
    };

    onCreateProject(newProject);
    onSelectProject(newProject.id);
    setIsCreating(false);
    setName('');
    setDescription('');
    setInstructions('');
  };

  const startEdit = (proj: Project) => {
    setEditingId(proj.id);
    setEditName(proj.name);
    setEditInstructions(proj.instructions || '');
  };

  const saveEdit = (id: string) => {
    onUpdateProject(id, {
      name: editName.trim(),
      instructions: editInstructions.trim(),
    });
    setEditingId(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative z-10 w-full max-w-xl bg-[#09110d] border border-emerald-800/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-900/40 bg-[#0c1611]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-emerald-100">
                  Workspaces & Projects
                </h2>
                <p className="text-xs text-emerald-400/60">
                  Isolate chats, files, and custom prompt directives per project
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-emerald-400/80 hover:text-emerald-100 hover:bg-emerald-950/60 transition-colors"
              aria-label="Close projects"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {isCreating ? (
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Next.js SaaS, Marketing Q4"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b140f] border border-emerald-900/50 text-sm text-emerald-100 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1">
                    Project Purpose & Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short summary of this workspace"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0b140f] border border-emerald-900/50 text-sm text-emerald-100 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1">
                    Workspace Context Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Guidelines or specifications applied to every conversation inside this project."
                    className="w-full p-3 rounded-xl bg-[#0b140f] border border-emerald-900/50 text-xs text-emerald-100 outline-none focus:border-emerald-500 resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 text-xs font-medium border border-emerald-800/40"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors shadow-md"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      onSelectProject(undefined);
                      onClose();
                    }}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                      !activeProjectId
                        ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40 font-semibold'
                        : 'text-emerald-400/70 border-emerald-950 hover:text-emerald-200'
                    }`}
                  >
                    All Conversations (No Project Filter)
                  </button>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Project</span>
                  </button>
                </div>

                <div className="space-y-2.5 mt-2">
                  {projects.map((proj) => {
                    const isSelected = proj.id === activeProjectId;
                    const isEditing = proj.id === editingId;

                    return (
                      <div
                        key={proj.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                            : 'bg-[#0b140f] border-emerald-950/60 hover:border-emerald-700/40'
                        }`}
                      >
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-xs text-white outline-none"
                            />
                            <textarea
                              rows={2}
                              value={editInstructions}
                              onChange={(e) => setEditInstructions(e.target.value)}
                              placeholder="Workspace prompt instructions"
                              className="w-full p-2 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-xs text-emerald-100 outline-none resize-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-2.5 py-1 rounded text-xs text-emerald-400 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => saveEdit(proj.id)}
                                className="px-3 py-1 rounded bg-emerald-500 text-black text-xs font-semibold"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3">
                            <div
                              onClick={() => {
                                onSelectProject(proj.id);
                                onClose();
                              }}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <FolderOpen className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                <span className="font-semibold text-sm text-emerald-100">
                                  {proj.name}
                                </span>
                                {isSelected && (
                                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    Active
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-emerald-400/70 mt-1">
                                {proj.description}
                              </p>
                              {proj.instructions && (
                                <p className="text-[11px] text-emerald-500/60 mt-1 italic line-clamp-1">
                                  "{proj.instructions}"
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => startEdit(proj)}
                                className="p-1.5 rounded-lg text-emerald-500/70 hover:text-emerald-200 hover:bg-emerald-950 transition-colors"
                                title="Edit project"
                                aria-label="Edit project"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {projects.length > 1 && (
                                <button
                                  onClick={() => onDeleteProject(proj.id)}
                                  className="p-1.5 rounded-lg text-emerald-500/70 hover:text-red-400 hover:bg-emerald-950 transition-colors"
                                  title="Delete project"
                                  aria-label="Delete project"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
