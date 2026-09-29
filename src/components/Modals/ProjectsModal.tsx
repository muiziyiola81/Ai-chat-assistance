import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  FolderKanban,
  Plus,
  Trash2,
  Edit2,
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
      description: description.trim() || 'Workspace',
      instructions: instructions.trim(),
      createdAt: Date.now(),
      color: '#FFFFFF',
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
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative z-10 w-full max-w-lg bg-[#0A0A0A] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1A1A1A] bg-[#0E0E0E]">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#FFFFFF]" />
              <h2 className="text-sm font-semibold text-[#FFFFFF]">
                Workspaces & Projects
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#737373] hover:text-[#FFFFFF] hover:bg-[#171717] transition-colors"
              aria-label="Close projects"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
            {isCreating ? (
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#FFFFFF] mb-1">
                    Workspace Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Next.js App, Technical Writing"
                    className="w-full px-3 py-2 rounded-xl bg-[#111111] border border-[#262626] text-xs text-[#FFFFFF] outline-none focus:border-[#404040]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A3A3A3] mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Workspace purpose"
                    className="w-full px-3 py-2 rounded-xl bg-[#111111] border border-[#262626] text-xs text-[#FFFFFF] outline-none focus:border-[#404040]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A3A3A3] mb-1">
                    Workspace Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Directives applied to conversations in this workspace."
                    className="w-full p-2.5 rounded-xl bg-[#111111] border border-[#262626] text-xs text-[#FFFFFF] outline-none focus:border-[#404040] resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1C1C1C] text-[#A3A3A3] text-xs font-medium border border-[#262626]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#E5E5E5] text-[#000000] font-medium text-xs transition-colors"
                  >
                    Create Workspace
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
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      !activeProjectId
                        ? 'bg-[#171717] text-[#FFFFFF] border-[#333333]'
                        : 'text-[#737373] border-[#1F1F1F] hover:text-[#FFFFFF]'
                    }`}
                  >
                    All Conversations (No Filter)
                  </button>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#171717] hover:bg-[#222222] border border-[#262626] text-[#FFFFFF] text-xs font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>

                <div className="space-y-2 mt-2">
                  {projects.map((proj) => {
                    const isSelected = proj.id === activeProjectId;
                    const isEditing = proj.id === editingId;

                    return (
                      <div
                        key={proj.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-[#141414] border-[#3A3A3A]'
                            : 'bg-[#0E0E0E] border-[#1F1F1F] hover:border-[#2A2A2A]'
                        }`}
                      >
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#141414] border border-[#333333] text-xs text-[#FFFFFF] outline-none"
                            />
                            <textarea
                              rows={2}
                              value={editInstructions}
                              onChange={(e) => setEditInstructions(e.target.value)}
                              placeholder="Workspace prompt instructions"
                              className="w-full p-2 rounded-lg bg-[#141414] border border-[#333333] text-xs text-[#FFFFFF] outline-none resize-none"
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-2.5 py-1 rounded text-xs text-[#737373] hover:text-[#FFFFFF]"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => saveEdit(proj.id)}
                                className="px-3 py-1 rounded bg-[#FFFFFF] text-[#000000] text-xs font-medium"
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
                                <FolderOpen className="w-3.5 h-3.5 text-[#A3A3A3] flex-shrink-0" />
                                <span className="font-medium text-xs text-[#FFFFFF]">
                                  {proj.name}
                                </span>
                                {isSelected && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1C1C1C] border border-[#2A2A2A] text-[#FFFFFF]">
                                    Active
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#737373] mt-0.5">
                                {proj.description}
                              </p>
                            </div>

                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <button
                                onClick={() => startEdit(proj)}
                                className="p-1.5 rounded text-[#737373] hover:text-[#FFFFFF] hover:bg-[#171717] transition-colors"
                                title="Edit"
                                aria-label="Edit"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              {projects.length > 1 && (
                                <button
                                  onClick={() => onDeleteProject(proj.id)}
                                  className="p-1.5 rounded text-[#737373] hover:text-[#FFFFFF] hover:bg-[#171717] transition-colors"
                                  title="Delete"
                                  aria-label="Delete"
                                >
                                  <Trash2 className="w-3 h-3" />
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
