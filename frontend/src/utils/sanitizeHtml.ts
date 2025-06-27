const ALLOWED_TAGS = ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img'];
const DANGEROUS_TAGS = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'meta', 'link', 'style'];
const DANGEROUS_ATTRIBUTES = ['onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onkeydown', 'onkeyup', 'onkeypress', 'javascript:', 'vbscript:', 'data:'];

export function sanitizeHtml(html: string): string {
  let sanitized = html;

  DANGEROUS_TAGS.forEach(tag => {
    const regex = new RegExp(`<\\/?${tag}[^>]*>`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  sanitized = sanitized.replace(/<img[^>]*(?:onerror|onload|onclick)[^>]*>/gi, '');
  DANGEROUS_ATTRIBUTES.forEach(attr => {
    const regex = new RegExp(`\\s*${attr.replace(':', '\\:')}[^\\s>]*`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  return sanitized;
} 