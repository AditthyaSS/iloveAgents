export function openExternal(url) {
  const opened = window.open(url, '_blank', 'noopener')
  if (opened) {
    opened.opener = null
  }
  return opened
}
