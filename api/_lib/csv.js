export function escapeCsv(value) {
  let text = String(value ?? '')
  // Quoting alone does not stop spreadsheet formula evaluation.
  // eslint-disable-next-line no-control-regex -- attackers can prefix formulas with control characters
  if (/^[\s\u0000-\u001f]*[=+@-]/u.test(text) || /^[\t\r\n]/u.test(text)) text = "'" + text
  return `"${text.replaceAll('"', '""')}"`
}

export function rowsToCsv(rows, headers) {
  return [headers.map(escapeCsv).join(','), ...rows.map((row) => headers.map((key) => escapeCsv(row[key])).join(','))].join('\r\n')
}
