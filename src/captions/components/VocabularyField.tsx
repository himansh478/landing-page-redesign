'use client';

import { useEffect, useState } from 'react';
import { readVocabulary, saveVocabulary } from '@/captions/lib/vocabulary';

/** Names and brands to spell exactly. Applied to new uploads and to proofreading. */
export function VocabularyField() {
  const [text, setText] = useState('');

  useEffect(() => setText(readVocabulary().join(', ')), []);

  return (
    <label className="vocabulary">
      Names and brands to spell exactly
      <textarea
        id="vocabulary"
        rows={2}
        value={text}
        placeholder="Cwaya, Sehore, your client names"
        onChange={(e) => {
          setText(e.target.value);
          saveVocabulary(e.target.value.split(',').map((w) => w.trim()).filter(Boolean));
        }}
      />
    </label>
  );
}
