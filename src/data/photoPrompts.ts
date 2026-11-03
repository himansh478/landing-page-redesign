import type { PromptItem } from '@/types/prompts';

// Built-in prompts that ship with the site; prompts uploaded from the admin
// panel (Supabase 'prompts' table) are shown before these.
export const photoPrompts: PromptItem[] = [
  {
    id: 'rebel-poster',
    kind: 'photo',
    title: 'REBEL — Cinematic Character Poster',
    uploads: ['Your own photo (identity reference)', 'The REBEL poster (composition & style reference)'],
    media: {
      type: 'image',
      src: '/images/prompts/rebel-poster.webp',
      alt: 'Cinematic REBEL character poster: a man in a cream suit in front of giant distressed REBEL lettering',
      width: 1024,
      height: 1536,
    },
    prompt: `Create a premium, highly detailed, cinematic illustrated character poster using my uploaded personal photograph as the ONLY identity reference and the uploaded REBEL poster as the primary composition and visual-style reference.

MOST IMPORTANT — PRESERVE MY IDENTITY:
Use the exact person from my uploaded photograph. Preserve my real facial identity, facial proportions, eyes, nose, lips, jawline, skin tone, hairline and any distinctive facial features. The finished character must unmistakably look like me, not the person depicted in the reference poster. Do not mix identities, substitute another face, beautify excessively or change my age. Transform my own photograph into the illustrated aesthetic of the reference while retaining recognizable facial likeness.

COMPOSITION AND FRAMING:
Create a vertical 2:3 portrait poster, closely following the reference image's overall layout. Position me prominently in the center, with a powerful, confident, rebellious personality. Use a cinematic low-angle or slightly upward-looking perspective where suitable for my photograph. Turn my head slightly toward the side for a strong, thoughtful expression, but do not distort my original facial features. Show a substantial upper-body portrait, with the shoulder, torso and arm creating a dynamic diagonal flow toward the lower part of the frame. Preserve natural anatomy and realistic body proportions.

If my uploaded photograph does not show the complete pose, intelligently reconstruct the hidden body, clothing and arm position without changing my identity. Keep my actual hairstyle and facial hair consistent with my photo.

GIANT BACKGROUND TYPOGRAPHY:
Place the word “REBEL” in enormous, uppercase, extra-bold, condensed block typography across the upper portion of the poster. Use distressed olive-brown and dark khaki lettering, with worn ink, scratches, chipped edges and subtle vintage paper texture. Let the portrait overlap some of the typography naturally, creating convincing foreground-background depth. Make the title dramatic and dominant without covering my eyes or obscuring important facial details.

Add the small headline “I DON'T FOLLOW RULES.” above the title and “I MAKE MY OWN PATH.” beneath the left portion of the title.

On the right margin, include a clean editorial text arrangement:
“[YOUR NAME]
AS
THE REBEL”

Add small vertical typography along the margins:
“FEARLESS — FOCUSED — UNSTOPPABLE”
and
“STRENGTH IS SILENT. LEGENDS DON'T NEED A TITLE.”

Include thin vertical rules, tiny decorative marks, minimal geometric accents, distressed ink speckles and a small editorial number “08”.`,
  },
];
