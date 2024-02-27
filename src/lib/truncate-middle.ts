export function truncateMiddle(
  str: string,
  frontChars: number,
  backChars: number,
  separator: string = "...",
): string {
  if (str.length <= frontChars + backChars) {
    return str;
  }

  const start = str.substring(0, frontChars);
  const end = str.substring(str.length - backChars);
  return `${start}${separator}${end}`;
}
