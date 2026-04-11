/**
 * Minimal RFC 4180 CSV helper.
 * Converts an array of plain objects to a CSV string with proper quoting.
 * No external dependency.
 */

type Cell = string | number | boolean | null | undefined | Date;
type Row = Record<string, Cell>;

/**
 * Escape a single cell so it survives commas, quotes, and newlines in the
 * resulting CSV. Strategy: wrap in double quotes if the cell contains any
 * special character, and double any embedded quotes.
 */
function escapeCell(value: Cell): string {
  if (value === null || value === undefined) return "";
  let str: string;
  if (value instanceof Date) {
    str = value.toISOString();
  } else {
    str = String(value);
  }
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Build a CSV string from a list of rows. Headers are derived from the
 * first row's keys. If `headers` is passed explicitly, that order is used
 * and missing columns are rendered as empty cells.
 *
 * Emits RFC 4180-style CRLF line endings for maximum spreadsheet compat.
 */
export function toCsv<T extends Row>(rows: T[], headers?: Array<keyof T>): string {
  if (rows.length === 0) {
    return headers ? (headers as string[]).join(",") : "";
  }

  const cols = (headers as string[] | undefined) || Object.keys(rows[0]);
  const lines: string[] = [];
  lines.push(cols.map((c) => escapeCell(c)).join(","));
  for (const row of rows) {
    const line = cols.map((c) => escapeCell((row as Row)[c]));
    lines.push(line.join(","));
  }
  return lines.join("\r\n") + "\r\n";
}

/**
 * Convenience helper: wrap a CSV string in a Response with download headers.
 */
export function csvResponse(body: string, filename: string): Response {
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      // Prevent caching of personal data
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
    },
  });
}

/**
 * Convenience helper: wrap a JSON object in a Response with download headers.
 */
export function jsonDownloadResponse(body: unknown, filename: string): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
    },
  });
}
