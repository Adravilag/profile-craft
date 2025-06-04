// src/components/sections/skills/components/TechnicalTerminal.tsx

import React from 'react';
import FakeTerminal, { type TerminalCommand } from '../../../ui/FakeTerminal';

interface TechnicalTerminalProps {
  className?: string;
  theme?: 'dark' | 'light' | 'matrix' | 'retro';
  speed?: 'slow' | 'normal' | 'fast';
}

const TechnicalTerminal: React.FC<TechnicalTerminalProps> = ({
  className = '',
  theme = 'dark',
  speed = 'normal'
}) => {
  
  const technicalCommands: TerminalCommand[] = [
    {
      command: 'whoami',
      output: [
        'Desarrollador Full Stack',
        'Especializado en tecnologías web modernas',
        'Apasionado por la innovación y el código limpio'
      ],
      delay: 800,
      type: 'success'
    },
    {
      command: 'cat /skills/frontend.json',
      output: [
        '{',
        '  "languages": ["JavaScript", "TypeScript", "HTML5", "CSS3"],',
        '  "frameworks": ["React", "Vue.js", "Angular"],',
        '  "styling": ["Tailwind CSS", "Material Design", "Sass"],',
        '  "build_tools": ["Vite", "Webpack", "Parcel"],',
        '  "expertise_level": "avanzado"',
        '}'
      ],
      delay: 1000,
      type: 'output'
    },
    {
      command: 'ls /backend/technologies',
      output: [
        'node.js/',
        'python/',
        'databases/',
        'docker/',
        'apis/',
        'microservices/'
      ],
      delay: 600,
      type: 'output'
    },
    {
      command: 'docker ps --format "table {{.Names}}\\t{{.Status}}"',
      output: [
        'NAMES               STATUS',
        'portfolio-app       Up 2 hours',
        'postgres-db         Up 2 hours',
        'redis-cache         Up 2 hours',
        'nginx-proxy         Up 2 hours'
      ],
      delay: 800,
      type: 'output'
    },
    {
      command: 'git log --oneline -5',
      output: [
        'f4a8b2c feat: implementar terminal interactiva en CV',
        '3d7e1a9 fix: optimizar rendimiento de intersecciones CSS',
        '2c9f8b1 feat: añadir sistema de animaciones avanzadas',
        '8e4d7f2 refactor: mejorar arquitectura de componentes',
        '5a1c3e8 feat: integrar Material Design 3'
      ],
      delay: 700,
      type: 'output'
    },
    {
      command: 'npm run test',
      output: [
        'Test Suites: 15 passed, 15 total',
        'Tests:       89 passed, 89 total',
        'Snapshots:   12 passed, 12 total',
        'Time:        8.542 s',
        'Ran all test suites.'
      ],
      delay: 1200,
      type: 'success'
    },
    {
      command: 'python -c "import skills; print(skills.get_expertise())"',
      output: [
        '🐍 Python: Django, Flask, FastAPI',
        '🤖 Machine Learning: TensorFlow, PyTorch',
        '📊 Data Analysis: Pandas, NumPy, Matplotlib',
        '🔄 Automation: Selenium, Beautiful Soup',
        '☁️  Cloud: AWS, GCP, Azure'
      ],
      delay: 900,
      type: 'output'
    },
    {
      command: 'curl -s https://api.github.com/users/mi-usuario | jq ".public_repos"',
      output: [
        '42'
      ],
      delay: 500,
      type: 'success'
    },
    {
      command: 'cat /achievements/recent.txt',
      output: [
        '✅ Desarrollé arquitectura de microservicios escalable',
        '✅ Implementé CI/CD pipeline con GitHub Actions',
        '✅ Optimicé rendimiento de aplicación en 60%',
        '✅ Mentoré a 5 desarrolladores junior',
        '✅ Contribuí a 12 proyectos open source'
      ],
      delay: 1000,
      type: 'success'
    },
    {
      command: 'echo "¿Interesado en colaborar? ¡Contactemos!"',
      output: [
        '💼 Disponible para proyectos freelance',
        '🤝 Abierto a colaboraciones',
        '📧 Respondo mensajes en 24h',
        '🚀 Siempre buscando nuevos desafíos'
      ],
      delay: 800,
      type: 'success'
    }
  ];

  return (
    <div className={`technical-terminal-wrapper ${className}`}>
      <FakeTerminal
        commands={technicalCommands}
        title="Terminal - Habilidades Técnicas"
        theme={theme}
        autoStart={true}
        loop={true}
        speed={speed}
        className="skills-terminal"
      />
    </div>
  );
};

export default TechnicalTerminal;
