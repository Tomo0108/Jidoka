"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: number;
  name: string;
  description?: string;
}

interface ProjectSettingsProps {
  project: Project;
  onClose: () => void;
  onUpdate: (project: Project) => void;
  onDelete: () => void;
}

export function ProjectSettings({ project, onClose, onUpdate, onDelete }: ProjectSettingsProps) {
  const { toast } = useToast();
  const [editingProjectName, setEditingProjectName] = useState(project.name);
  const [editingProjectDescription, setEditingProjectDescription] = useState(project.description || "");

  const handleUpdateProject = async () => {
    // バリデーション
    const trimmedName = editingProjectName.trim();
    if (!trimmedName) {
      toast({
        variant: "destructive",
        title: "入力エラー",
        description: "プロジェクト名を入力してください。",
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: trimmedName,
          description: editingProjectDescription.trim()
        }),
      });
      
      if (response.ok) {
        const updatedProject: Project = await response.json();
        onUpdate(updatedProject);
        onClose();
        
        toast({
          title: "プロジェクト更新完了",
          description: "プロジェクト情報が更新されました。",
        });
      } else {
        throw new Error('Failed to update project');
      }
    } catch (error) {
      console.error("Failed to update project:", error);
      toast({
        variant: "destructive",
        title: "更新エラー",
        description: "プロジェクトの更新に失敗しました。",
      });
    }
  };

  const handleDeleteProject = async () => {
    const confirmDelete = confirm(`プロジェクト「${project.name}」を削除しますか？この操作は取り消せません。`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8000/api/projects/${project.id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        onDelete();
        onClose();
        
        toast({
          title: "プロジェクト削除完了",
          description: "プロジェクトが削除されました。",
        });
      } else {
        throw new Error('Failed to delete project');
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast({
        variant: "destructive",
        title: "削除エラー",
        description: "プロジェクトの削除に失敗しました。",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background border rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">プロジェクト設定</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">
          プロジェクトの名前と説明を編集できます。
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">プロジェクト名</Label>
            <Input
              id="project-name"
              value={editingProjectName}
              onChange={(e) => setEditingProjectName(e.target.value)}
              placeholder="プロジェクト名を入力"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleUpdateProject();
                }
              }}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project-description">説明（任意）</Label>
            <Textarea
              id="project-description"
              value={editingProjectDescription}
              onChange={(e) => setEditingProjectDescription(e.target.value)}
              placeholder="プロジェクトの説明を入力..."
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault();
                  handleUpdateProject();
                }
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-6 sm:flex-row">
          <Button
            variant="destructive"
            onClick={handleDeleteProject}
            className="sm:mr-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            プロジェクトを削除
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button onClick={handleUpdateProject}>
              <Edit className="h-4 w-4 mr-2" />
              更新
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 