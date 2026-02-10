import { useToast } from '../../shared/Toast';

export function useBrandActions(data, setCopiedColor) {
  const { toast } = useToast();

  const buildText = () =>
`Brand Names: ${data.name_options?.join(', ')}
Taglines: ${data.taglines?.join(' / ')}
Colors: ${data.color_palette?.map(c => typeof c === 'string' ? c : c.hex).join(', ')}
Voice & Tone: ${data.voice_tone}`;

  const copyAll = async () => {
    await navigator.clipboard.writeText(buildText());
    toast.success('Brand identity copied!');
  };

  const exportTxt = () => {
    const blob = new Blob([buildText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), {
      href: url,
      download: 'brand-identity.txt'
    }).click();
    URL.revokeObjectURL(url);
    toast.success('Exported successfully!');
  };

  const copyColor = async (hex) => {
    await navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    toast.success(`Copied ${hex}`);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return { copyAll, exportTxt, copyColor };
}
