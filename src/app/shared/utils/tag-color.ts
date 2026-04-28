export function tagColor(tag: string): { background: string; color: string; border: string } {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(hash) % 360;
  return {
    background: `hsl(${hue} 75% 92%)`,
    color: `hsl(${hue} 65% 28%)`,
    border: `hsl(${hue} 60% 75%)`,
  };
}
