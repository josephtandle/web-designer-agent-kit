function quotePosix(value) {
  const text = String(value)
  return /^[A-Za-z0-9_./:=+-]+$/.test(text) ? text : `'${text.replaceAll("'", "'\\''")}'`
}

function quoteWindows(value) {
  const text = String(value)
  if (/^[A-Za-z0-9_./:\\=+-]+$/.test(text)) return text
  return `'${text.replaceAll("'", "''")}'`
}

export function formatCommand(parts, platform = process.platform) {
  const quote = platform === 'win32' ? quoteWindows : quotePosix
  const command = parts.map(quote).join(' ')
  if (platform !== 'win32' || parts.length === 0 || quote(parts[0]) === String(parts[0])) return command
  return `& ${command}`
}
