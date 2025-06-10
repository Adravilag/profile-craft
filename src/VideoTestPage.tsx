// VideoTestPage.tsx - Página de prueba para videos

import React from "react";
import TestVideoPlayer from "./components/common/TestVideoPlayer";
import { useUnifiedTheme } from "./contexts/UnifiedThemeContext";

const VideoTestPage: React.FC = () => {
  const { currentGlobalTheme } = useUnifiedTheme();

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: currentGlobalTheme === 'dark' ? '#0d1117' : '#ffffff',
      paddingTop: '20px'
    }}>
      <TestVideoPlayer />
    </div>
  );
};

export default VideoTestPage;
