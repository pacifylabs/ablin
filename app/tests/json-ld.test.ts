import { describe, expect, it } from 'vitest';
import { jsonLdScriptContent } from '@/lib/json-ld';

describe('jsonLdScriptContent', () => {
  it('escapes less-than so a string cannot break out of a script tag', () => {
    const payload = { headline: '</script><img src=x onerror=alert(1)>' };
    const serialised = jsonLdScriptContent(payload);
    expect(serialised).not.toContain('</script>');
    expect(serialised).toContain('\\u003c/script>');
  });
});
