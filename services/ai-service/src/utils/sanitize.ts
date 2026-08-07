/**
 * Sanitizes user-controlled text before it is interpolated into an LLM prompt.
 *
 * This is a defense-in-depth measure, not a complete prompt-injection solution
 * (no purely textual filter can fully prevent injection). It focuses on
 * structural hardening:
 *  - Enforces a maximum length so a single field cannot dominate/overflow the prompt.
 *  - Strips control characters that have no legitimate use in prompt text.
 *  - Collapses excessive newlines, which are commonly used to simulate fake
 *    "system"/"assistant" turns or otherwise break out of the intended context.
 *  - Trims surrounding whitespace.
 */
export function sanitizePromptInput(input: unknown, maxLength = 500): string {
  if (input === null || input === undefined) {
    return '';
  }

  let text = String(input);

  // Strip control characters (except tab/newline), which have no legitimate
  // use in natural-language prompt fields and can be used to smuggle content.
  // eslint-disable-next-line no-control-regex
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');

  // Collapse runs of 3+ newlines down to 2, to reduce the ability to
  // fabricate the appearance of new prompt sections.
  text = text.replace(/\n{3,}/g, '\n\n');

  text = text.trim();

  if (text.length > maxLength) {
    text = text.slice(0, maxLength).trim();
  }

  return text;
}
