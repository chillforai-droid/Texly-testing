/**
 * FileTree.tsx
 * ─────────────────────────────────────────────
 * Recursive file tree for DevStudio sidebar
 */

import React, { useState } from 'react';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  language?: string;
  icon?: string;
  children?: FileNode[];
}

interface FileTreeProps {
  nodes: FileNode[];
  activeFile: string;
  onFileClick: (node: FileNode) => void;
  depth?: number;
}

function getFileColor(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    tsx: '#4ec9b0', ts: '#4ec9b0', jsx: '#f0db4f', js: '#f0db4f',
    css: '#a78bfa', scss: '#a78bfa', html: '#e34c26', json: '#fbbf24',
    md: '#94a3b8', sql: '#60a5fa', sh: '#6ee7b7', env: '#fca5a5',
    py: '#4ade80',
  };
  return map[ext] ?? '#9ca3af';
}

function getFolderIcon(isOpen: boolean): string {
  return isOpen ? '📂' : '📁';
}

function FileTreeNode({
  node, activeFile, onFileClick, depth = 0,
}: { node: FileNode; activeFile: string; onFileClick: (n: FileNode) => void; depth?: number }) {
  const [open, setOpen] = useState(
    // Auto-expand src, components folders
    depth < 2 && (node.name === 'src' || node.name === 'components' || node.name === 'api')
  );
  const isActive = node.path === activeFile;
  const indent = depth * 12 + 8;

  if (node.type === 'folder') {
    return (
      <>
        <div
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-1 py-0.5 pr-2 cursor-pointer hover:bg-[#2a2d2e] transition-colors ${
            isActive ? 'bg-[#37373d]' : ''
          }`}
          style={{ paddingLeft: indent }}
        >
          <span className="text-[11px] w-3.5 text-center text-[#888]">
            {open ? '▾' : '▸'}
          </span>
          <span className="text-[12px]">{getFolderIcon(open)}</span>
          <span className="text-[12px] text-[#ccc] truncate">{node.name}</span>
        </div>
        {open && node.children?.map((child) => (
          <FileTreeNode
            key={child.path}
            node={child}
            activeFile={activeFile}
            onFileClick={onFileClick}
            depth={depth + 1}
          />
        ))}
      </>
    );
  }

  return (
    <div
      onClick={() => onFileClick(node)}
      className={`flex items-center gap-1.5 py-0.5 pr-2 cursor-pointer transition-colors ${
        isActive ? 'bg-[#37373d] border-l-2 border-[#007acc]' : 'hover:bg-[#2a2d2e]'
      }`}
      style={{ paddingLeft: indent + 18 }}
    >
      <span className="text-[11px]" style={{ color: getFileColor(node.name) }}>
        {node.icon ?? '📄'}
      </span>
      <span
        className="text-[12px] truncate"
        style={{ color: isActive ? '#fff' : '#ccc' }}
      >
        {node.name}
      </span>
    </div>
  );
}

export function FileTree({ nodes, activeFile, onFileClick, depth = 0 }: FileTreeProps) {
  return (
    <>
      {nodes.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          activeFile={activeFile}
          onFileClick={onFileClick}
          depth={depth}
        />
      ))}
    </>
  );
}
