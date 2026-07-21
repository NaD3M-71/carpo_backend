import sanitizeHtml from 'sanitize-html';

// Etiquetas que produce el editor Trix (https://trix-editor.org/) en su
// configuración por defecto. Cualquier otra etiqueta/atributo se descarta,
// aunque el request no haya pasado por el editor real.
const TRIX_TAGS = [
  'div', 'br', 'p',
  'strong', 'b', 'em', 'i', 'del', 's', 'u',
  'a',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'h1'
];

export const sanitizeBioHtml = (bio: unknown): string | null => {
  if (typeof bio !== 'string') return null;

  return sanitizeHtml(bio, {
    allowedTags: TRIX_TAGS,
    allowedAttributes: {
      a: ['href', 'target', 'rel']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow' })
    }
  }).trim();
};
