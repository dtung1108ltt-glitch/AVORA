/**
 * Sanitizes free-text user input before it is interpolated into an LLM prompt.
 *
 * - Strips characters/patterns commonly used for prompt-injection attempts
 *   (role markers, code fences, control characters).
 * - Collapses excess whitespace.
 * - Truncates to a maximum length to bound token usage and blast radius.
 *
 * This is a defense-in-depth measure, not a full jailbreak filter — it should
 * be paired with system-prompt hardening and output validation.
 */
export function sanitizePromptInput(input: unknown, maxLength: number = 500): string {
  if (input === null || input === undefined) {
    return '';
  }

  let value = String(input);

  // Remove null bytes and other non-printable/control characters (keep newlines/tabs).
  value = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');

  // Strip common prompt-injection / role-hijack markers.
  value = value.replace(/```/g, "'''");
  value = value.replace(/\b(system|assistant|user)\s*:/gi, '$1 -');
  value = value.replace(/<\s*\/?\s*(system|instructions?|prompt)\s*>/gi, '');
  value = value.replace(/\b(ignore|disregard)\s+(all\s+|any\s+)?(previous|prior|above)\s+(instructions?|prompts?)\b/gi, '');

  // Collapse repeated whitespace and trim.
  value = value.replace(/\s+/g, ' ').trim();

  // Bound the length.
  if (value.length > maxLength) {
    value = value.slice(0, maxLength).trim();
  }

  return value;
}
