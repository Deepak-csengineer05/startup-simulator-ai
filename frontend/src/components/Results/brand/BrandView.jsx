import { motion } from 'framer-motion';
import { useState } from 'react';
import { container } from './motion';

import BrandHero from './BrandHero';
import BrandNames from './BrandNames';
import ColorPalette from './ColorPalette';
import Taglines from './Taglines';
import VoiceTone from './VoiceTone';
import EmptyBrandState from './EmptyBrandState';
import { useBrandActions } from './useBrandActions';
import '../ResultsStyles.css';

function BrandView({ data }) {
  const [copiedColor, setCopiedColor] = useState(null);
  const actions = useBrandActions(data, setCopiedColor);

  if (!data) return <EmptyBrandState />;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="results-container"
    >
      <BrandHero data={data} {...actions} />
      <BrandNames names={data.name_options} />
      <ColorPalette
        colors={data.color_palette}
        copiedColor={copiedColor}
        onCopy={actions.copyColor}
      />
      <Taglines taglines={data.taglines} />
      <VoiceTone tone={data.voice_tone} />
    </motion.div>
  );
}

export default BrandView;
