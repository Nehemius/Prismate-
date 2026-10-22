import React from 'react';
import { motion } from 'motion/react';
import ReactionViewerWorkspace from './chemistry/ReactionViewerWorkspace';

interface ReactionsModalProps {
  onClose: () => void;
}

export const ReactionsModal: React.FC<ReactionsModalProps> = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 4000,
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <ReactionViewerWorkspace onBack={onClose} />
    </motion.div>
  );
};

export default ReactionsModal;
