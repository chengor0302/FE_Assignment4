const ALLOWED_TAGS = ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img'];
const DANGEROUS_TAGS = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'meta', 'link', 'style'];
const DANGEROUS_ATTRIBUTES = ['onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onkeydown', 'onkeyup', 'onkeypress', 'javascript:', 'vbscript:', 'data:'];

export function sanitizeHtml(html: string): string {
  let sanitized = html;

  // First, remove dangerous tags completely
  DANGEROUS_TAGS.forEach(tag => {
    const regex = new RegExp(`<\\/?${tag}[^>]*>`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  // Remove img tags with dangerous attributes - this is key for blocking XSS
  sanitized = sanitized.replace(/<img[^>]*(?:onerror|onload|onclick)[^>]*>/gi, '');
  
  // Remove dangerous attributes from all remaining tags
  DANGEROUS_ATTRIBUTES.forEach(attr => {
    const regex = new RegExp(`\\s*${attr.replace(':', '\\:')}[^\\s>]*`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  // Remove any remaining script-like content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Note: We're using a blacklist approach here rather than whitelist
  // This allows safe formatting tags like <b>, <i>, <u> to pass through
  // while blocking dangerous tags and attributes
  
  return sanitized;
} 