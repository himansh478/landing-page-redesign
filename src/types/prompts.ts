export type PromptKind = 'photo' | 'video';

export interface PromptItem {
  id: string;
  kind: PromptKind;
  title: string;
  prompt: string;
  /** What to upload alongside the prompt */
  uploads: string[];
  media: {
    type: 'image' | 'video';
    src: string;
    /** Still frame shown before a video plays */
    poster?: string;
    alt: string;
    width: number;
    height: number;
  };
  published?: boolean;
}
