export function stringToHex(str: string): string {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    let hex = str.charCodeAt(i).toString(16);
    result += hex;
  }
  return result;
}
