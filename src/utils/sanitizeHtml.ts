/**
 * HTML Sanitization Utilities
 * Prevents XSS vulnerabilities in HTML generation
 */

// Simple HTML entity encoding to prevent XSS
export const escapeHtml = (text: string | number | null | undefined): string => {
  if (text === null || text === undefined) return '';
  
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Safe template literal function for HTML generation
export const safeHtml = (strings: TemplateStringsArray, ...values: any[]): string => {
  let result = '';
  
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    
    if (i < values.length) {
      const value = values[i];
      
      // If the value is marked as safe (wrapped in SafeHtml), don't escape it
      if (value && typeof value === 'object' && value._isSafeHtml) {
        result += value.content;
      } else {
        // Escape all other values
        result += escapeHtml(value);
      }
    }
  }
  
  return result;
};

// Wrapper class for HTML content that's already safe
export class SafeHtml {
  public readonly _isSafeHtml = true;
  
  constructor(public readonly content: string) {}
}

// Helper to mark HTML as safe (use with caution - only for static HTML)
export const markAsSafeHtml = (html: string): SafeHtml => new SafeHtml(html);

// Format currency safely
export const formatCurrencySafe = (amount: number, currency: string = 'USD'): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  });
  return escapeHtml(formatter.format(amount));
};

// Format date safely
export const formatDateSafe = (date: string | Date): string => {
  try {
    const d = new Date(date);
    return escapeHtml(d.toLocaleDateString());
  } catch {
    return escapeHtml('Invalid Date');
  }
};

// Safe HTML template for reports (predefined safe structure)
export const createReportTemplate = (config: {
  title: string;
  subtitle: string;
  description: string;
  borderColor: string;
  content: string; // This should be pre-sanitized HTML
}): string => {
  return `
    <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid ${escapeHtml(config.borderColor)};">
      <div style="text-align: center;">
        <h1 style="font-size: 32px; font-weight: bold; color: ${escapeHtml(config.borderColor)}; margin-bottom: 10px;">
          📊 ${escapeHtml(config.title)}
        </h1>
        <h2 style="font-size: 24px; color: #1f2937; margin-bottom: 8px;">
          ${escapeHtml(config.subtitle)}
        </h2>
        <p style="color: #6b7280; font-size: 14px;">
          ${escapeHtml(config.description)}
        </p>
      </div>
    </div>
    ${config.content}
  `;
};