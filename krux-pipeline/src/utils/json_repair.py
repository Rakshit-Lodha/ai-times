import json
import re


def extract_json_block(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    return text


def escape_quotes_inside_output(json_text: str) -> str:
    """
    Escapes unescaped double-quotes that appear inside the value of "output": "..."
    Targets ONLY the output field so we don't accidentally corrupt JSON structure.
    """
    i = 0
    n = len(json_text)
    out = []

    while i < n:
        j = json_text.find('"output"', i)
        if j == -1:
            out.append(json_text[i:])
            break

        out.append(json_text[i:j])
        i = j

        # copy '"output"'
        out.append('"output"')
        i += len('"output"')

        # match : " (with optional whitespace)
        m = re.match(r'\s*:\s*"', json_text[i:])
        if not m:
            # unexpected structure; just continue scanning
            continue

        out.append(m.group(0))
        i += m.end()

        # now we're inside the output string content
        escaped = False
        while i < n:
            ch = json_text[i]

            if escaped:
                out.append(ch)
                escaped = False
                i += 1
                continue

            if ch == '\\':
                out.append(ch)
                escaped = True
                i += 1
                continue

            if ch == '"':
                # Could be end-of-string OR an unescaped quote inside content.
                # Heuristic: if next non-space char is one of , } ] then it's end-of-string.
                k = i + 1
                while k < n and json_text[k].isspace():
                    k += 1

                if k < n and json_text[k] in [',', '}', ']']:
                    out.append('"')  # end of output string
                    i += 1
                    break
                else:
                    out.append('\\"')  # escape inner quote
                    i += 1
                    continue

            out.append(ch)
            i += 1

    return ''.join(out)


def safe_load_llm_json(text: str):
    cleaned = extract_json_block(text)

    # Quick truncation sanity checks
    if cleaned.count('{') != cleaned.count('}') or (cleaned.count('"') % 2 != 0):
        raise ValueError(
            "Model output looks truncated (unbalanced braces/quotes). "
            "Increase max_tokens or reduce output size."
        )

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Repair the most common failure: unescaped quotes inside "output" values
        repaired = escape_quotes_inside_output(cleaned)
        return json.loads(repaired)
