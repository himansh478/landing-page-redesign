import { useEffect } from 'react';
import { useEditor } from '@/captions/state/editor';
import { saveProject } from './storage';
import { rememberLook } from './styles';
import { pushProject } from './sync';
import { ensureTranslations } from './translate';

const DELAY = 600;
const SYNC_DELAY = 3000;

/** Saves shortly after every change, so a closed tab loses nothing. */
export function useAutosave() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let syncTimer: ReturnType<typeof setTimeout> | undefined;
    ensureTranslations();
    const unsubscribe = useEditor.subscribe((state, previous) => {
      if (!state.project || !state.doc || state.doc === previous.doc || !previous.doc) return;
      ensureTranslations();
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const { project, doc } = useEditor.getState();
        if (!project || !doc) return;
        const saved = await saveProject({ ...project, doc });
        rememberLook(doc);
        // Saving here is what protects the work, so a failed sync just waits for the next edit.
        clearTimeout(syncTimer);
        syncTimer = setTimeout(() => void pushProject(saved).catch(() => {}), SYNC_DELAY);
      }, DELAY);
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);
}
