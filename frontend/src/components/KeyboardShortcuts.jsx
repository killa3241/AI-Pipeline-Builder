import { useEffect } from 'react';
import { useStore } from '../store';

function isEditableTarget(target) {
  if (!target) return false;
  const tag = target.tagName?.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
}

export function KeyboardShortcuts() {
  const deleteSelected = useStore((state) => state.deleteSelected);
  const exportWorkflow = useStore((state) => state.exportWorkflow);
  const selectAllNodes = useStore((state) => state.selectAllNodes);
  const fitView = useStore((state) => state.fitView);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (isEditableTarget(e.target)) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        fitView();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        exportWorkflow();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        selectAllNodes();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deleteSelected, exportWorkflow, selectAllNodes, fitView]);

  return null;
}
