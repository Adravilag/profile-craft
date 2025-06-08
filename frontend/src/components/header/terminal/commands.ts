// src/components/terminal/commands.ts

export interface CommandResult {
  output: string[]; // Cada línea separada
  clearScreen?: boolean; // Si queremos limpiar el terminal antes de escribir
}

type CommandFn = (args: string[]) => CommandResult;

// Aquí definimos la "base de datos" de respuestas:
const COMMANDS: Record<string, CommandFn> = {
  help: () => ({
    output: [
      "Comandos disponibles:",
      "  help      - Muestra esta ayuda",
      "  about     - Información sobre mí",
      "  skills    - Lista de tecnologías que manejo",
      "  projects  - Proyectos destacados", 
      "  contact   - Información de contacto",
      "  experience- Experiencia profesional",
      "  education - Formación académica",
      "  clear     - Limpia la pantalla",
      "  whoami    - Información básica",
      "  ls        - Lista directorios disponibles",
      "  cat       - Muestra contenido de archivos",
      "",
      "🎮 Easter Eggs:",
      "  hack      - Modo hacking Hollywood",
      "  undertale - Experiencia tipo Undertale",
      "  matrix    - Follow the white rabbit",
      "  coffee    - Necesitas cafeína",
      "  sudo      - Permisos de administrador",
      "",
      "Tip: Puedes usar Tab para autocompletar comandos",
    ],
  }),

  about: () => ({
    output: [
      "🧑‍💻 Adrián Dávila Guerra",
      "",
      "Ingeniero Informático especializado en desarrollo Full Stack.",
      "Apasionado por la innovación, el código limpio y las buenas prácticas.",
      "Con experiencia en React, Spring Boot, Node.js y tecnologías modernas.",
      "",
      "🎯 Enfocado en crear soluciones escalables y experiencias de usuario excepcionales.",
      "🚀 Siempre aprendiendo y adoptando nuevas tecnologías.",
      "🤝 Colaborativo y orientado al trabajo en equipo.",
    ],
  }),

  whoami: () => ({
    output: [
      "Desarrollador Full Stack",
      "Especializado en tecnologías web modernas",
      "Apasionado por la innovación y el código limpio",
      "",
      "Stack principal: React + TypeScript + Node.js + Spring Boot"
    ],
  }),

  skills: () => ({
    output: [
      "🛠️  Mis habilidades técnicas:",
      "",
      "Frontend:",
      "  • React / Next.js     ⭐⭐⭐⭐⭐",
      "  • TypeScript          ⭐⭐⭐⭐⭐",
      "  • Vue.js / Angular    ⭐⭐⭐⭐",
      "  • HTML5 / CSS3 / SCSS ⭐⭐⭐⭐⭐",
      "  • Material Design     ⭐⭐⭐⭐",
      "",
      "Backend:",
      "  • Node.js / Express   ⭐⭐⭐⭐",
      "  • Spring Boot / Java  ⭐⭐⭐⭐",
      "  • Python / Django     ⭐⭐⭐",
      "  • RESTful APIs        ⭐⭐⭐⭐⭐",
      "",
      "Base de Datos:",
      "  • PostgreSQL / MySQL  ⭐⭐⭐⭐",
      "  • MongoDB             ⭐⭐⭐",
      "  • Redis               ⭐⭐⭐",
      "",
      "DevOps & Tools:",
      "  • Git / GitHub        ⭐⭐⭐⭐⭐",
      "  • Docker              ⭐⭐⭐⭐",
      "  • CI/CD               ⭐⭐⭐",
      "  • AWS / GCP           ⭐⭐⭐",
    ],
  }),

  projects: () => ({
    output: [
      "🚀 Proyectos destacados:",
      "",
      "1. Portfolio Personal Interactivo",
      "   📁 React + TypeScript + Vite",
      "   🎯 Terminal interactiva, animaciones avanzadas",
      "   🔗 https://github.com/tuusuario/portfolio",
      "",
      "2. E-commerce Full Stack",
      "   📁 Spring Boot + React + PostgreSQL",
      "   🎯 Microservicios, pagos en línea, dashboard admin",
      "   📊 +10k usuarios activos",
      "",
      "3. Chat en Tiempo Real",
      "   📁 Socket.io + React + Node.js",
      "   🎯 Salas privadas, notificaciones push",
      "   ⚡ Optimizado para 1000+ usuarios concurrentes",
      "",
      "4. Dashboard Analítico",
      "   📁 D3.js + React + Express",
      "   🎯 Visualización de datos en tiempo real",
      "   📈 Procesamiento de +1M registros diarios",
      "",
      "5. Sistema de Gestión Educativa",
      "   📁 Vue.js + Laravel + MySQL",
      "   🎯 Gestión de estudiantes, calificaciones, reportes",
      "   🏫 Implementado en 15+ instituciones",
      "",
      "Para más detalles: github.com/tuusuario",
    ],
  }),

  contact: () => ({
    output: [
      "📞 Información de contacto:",
      "",
      "📧 Email: adrian.davila@example.com",
      "💼 LinkedIn: linkedin.com/in/adrian-davila",
      "🐙 GitHub: github.com/adrian-davila",
      "🌐 Portfolio: www.adrian-davila.dev",
      "📱 Teléfono: +34 123 456 789",
      "📍 Ubicación: Madrid, España",
      "",
      "💡 Estado: Disponible para nuevos proyectos",
      "⏰ Tiempo de respuesta: < 24 horas",
      "🤝 Abierto a colaboraciones remotas",
    ],
  }),

  experience: () => ({
    output: [
      "💼 Experiencia profesional:",
      "",
      "🏢 Senior Full Stack Developer | TechCorp (2022 - Presente)",
      "   • Lideré equipo de 5 desarrolladores",
      "   • Arquitectura de microservicios escalables",
      "   • Mejora del 60% en rendimiento de aplicaciones",
      "",
      "🏢 Full Stack Developer | InnovaSoft (2020 - 2022)",
      "   • Desarrollo de aplicaciones React + Spring Boot",
      "   • Implementación de CI/CD pipelines",
      "   • Migración de sistemas legacy",
      "",
      "🏢 Junior Developer | StartupTech (2019 - 2020)",
      "   • Desarrollo frontend con Vue.js",
      "   • APIs RESTful con Node.js",
      "   • Colaboración en metodologías ágiles",
      "",
      "🎓 Freelancer (2018 - 2019)",
      "   • Desarrollo de sitios web personalizados",
      "   • E-commerce y landing pages",
      "   • +20 proyectos completados",
    ],
  }),

  education: () => ({
    output: [
      "🎓 Formación académica:",
      "",
      "🏛️  Ingeniería Informática",
      "   📍 Universidad Politécnica de Madrid",
      "   📅 2015 - 2019",
      "   🏆 Especialización en Desarrollo de Software",
      "",
      "📜 Certificaciones:",
      "   ✅ AWS Certified Developer Associate (2023)",
      "   ✅ Google Cloud Professional Developer (2022)",
      "   ✅ Oracle Java SE 11 Developer (2021)",
      "   ✅ React Developer Certification (2020)",
      "",
      "📚 Formación continua:",
      "   • Arquitectura de Microservicios (2023)",
      "   • DevOps & CI/CD Avanzado (2022)",
      "   • Machine Learning Fundamentals (2021)",
      "   • UX/UI Design Principles (2020)",
    ],
  }),

  ls: (args) => {
    const directories = [
      "skills/",
      "projects/",
      "experience/",
      "education/",
      "achievements/",
      "contact/",
      "certifications/",
      "personal/"
    ];
    
    if (args.length > 0) {
      const dir = args[0];
      switch (dir) {
        case "skills":
        case "skills/":
          return {
            output: [
              "frontend/",
              "backend/",
              "databases/",
              "devops/",
              "languages/",
              "frameworks/",
              "tools/"
            ]
          };
        case "projects":
        case "projects/":
          return {
            output: [
              "portfolio.json",
              "ecommerce.json", 
              "chat-app.json",
              "analytics-dashboard.json",
              "educational-system.json"
            ]
          };
        default:
          return {
            output: [`ls: cannot access '${dir}': No such file or directory`]
          };
      }
    }
    
    return {
      output: directories
    };
  },

  cat: (args) => {
    if (args.length === 0) {
      return {
        output: ["cat: missing file operand", "Try 'cat --help' for more information."]
      };
    }
    
    const file = args[0];
    switch (file) {
      case "portfolio.json":
        return {
          output: [
            "{",
            '  "name": "Portfolio Personal Interactivo",',
            '  "tech": ["React", "TypeScript", "Vite", "CSS3"],',
            '  "features": [',
            '    "Terminal interactiva",',
            '    "Animaciones avanzadas",',
            '    "Responsive design",',
            '    "Modo oscuro/claro"',
            '  ],',
            '  "status": "En producción",',
            '  "url": "https://adrian-davila.dev"',
            "}"
          ]
        };
      case "skills/frontend":
      case "skills/frontend.txt":
        return {
          output: [
            "React ⭐⭐⭐⭐⭐",
            "TypeScript ⭐⭐⭐⭐⭐", 
            "Vue.js ⭐⭐⭐⭐",
            "Angular ⭐⭐⭐",
            "HTML5/CSS3 ⭐⭐⭐⭐⭐",
            "SCSS/Sass ⭐⭐⭐⭐",
            "Material Design ⭐⭐⭐⭐"
          ]
        };
      default:
        return {
          output: [`cat: ${file}: No such file or directory`]
        };
    }
  },

  clear: () => ({
    output: [],
    clearScreen: true,
  }),

  // Comandos de Easter Eggs
  matrix: () => ({
    output: [
      "Wake up, Neo...",
      "The Matrix has you...", 
      "Follow the white rabbit.",
      "",
      "💊 Tema Matrix activado. Reinicia para aplicar."
    ]
  }),

  undertale: () => ({
    output: [
      "* You feel like you're going to have a good time.",
      "",
      "* UNDERTALE MODE ACTIVATED",
      "",
      "* Despite everything, it's still you.",
      "",
      "* You are filled with DETERMINATION.",
      "",
      "❤️ HP 20/20",
      "",
      "* You encounter a wild programmer!",
      "* The programmer shows you their portfolio.",
      "* Their code is filled with... DETERMINATION.",
      "",
      "* Will you:",
      "  ❤️ HIRE    ⚔️ RECRUIT    🛡️ COLLABORATE    💔 MERCY",
      "",
      "* (You chose to view their skills.)",
      "* It's super effective!",
      "",
      "🎵 bgm_determination.ogg is now playing...",
      "",
      "* Adrián Dávila gained +100 EXP in Full Stack Development!",
      "* Adrián Dávila learned REACT MASTERY!",
      "* Adrián Dávila learned TYPESCRIPT EXPERTISE!",
      "",
      "* Your FRIENDSHIP with this developer increased!",
      "",
      "* Thank you for playing UNDERTALE PORTFOLIO! ❤️"
    ]
  }),

  coffee: () => ({
    output: [
      "☕ Preparando café...",
      "░░░░░░░░░░░░░░░░░░░░ 0%",
      "█░░░░░░░░░░░░░░░░░░░ 5%",
      "██████░░░░░░░░░░░░░░ 30%", 
      "███████████████░░░░ 75%",
      "████████████████████ 100%",
      "",
      "☕ ¡Café listo! Ahora puedo programar mejor 🚀"
    ]
  }),
  sudo: (_args) => ({
    output: [
      "🔐 [sudo] password for user:",
      "Sorry, try again.",
      "🔐 [sudo] password for user:", 
      "Sorry, try again.",
      "🔐 [sudo] password for user:",
      "",
      "sudo: 3 incorrect password attempts",
      "",
      "🤔 Pista: No necesitas permisos sudo aquí 😄"
    ]
  }),
  hack: () => ({
    output: [
      "🎬 HOLLYWOOD HACKING MODE ACTIVATED",
      "",
      "🔍 Scanning network topology...",
      "└── Found 127 vulnerable endpoints",
      "",
      "⚡ Initializing quantum encryption bypass...",
      "01001000 01100001 01100011 01101011 01101001 01101110 01100111",
      "11000010 10100000 11000010 10100000 11000010 10100000",
      "",
      "🔥 BREACHING MAINFRAME FIREWALL...",
      "▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░ 50%",
      "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%",
      "",
      "🚨 ACCESS GRANTED - LEVEL ALPHA",
      "├── Root privileges obtained",
      "├── Bypassing biometric scanners",
      "└── Disabling security cameras",
      "",
      "📡 DOWNLOADING CLASSIFIED FILES...",
      "secret_files.zip ████████████████████ 100%",
      "adrian_resume.pdf ███████████████████ 100%",
      "skills_matrix.json ██████████████████ 100%",
      "",
      "💾 Files successfully extracted to /tmp/loot/",
      "",
      "🏆 MISSION ACCOMPLISHED",
      "Time elapsed: 3.7 seconds",
      "Files obtained: 3",
      "Security alerts triggered: 0",
      "",
      "😄 Por supuesto, esto es solo una simulación...",
      "¡No hay hacking real aquí, solo diversión! 🎮"
    ]
  }),

  rm: (args) => {
    const fullCommand = args.join(" ");
    
    // Detectar variaciones del comando peligroso
    if (fullCommand.includes("-rf") && (fullCommand.includes("/") || fullCommand.includes("*"))) {
      return {
        output: [
          "🚨 ¡ALERTA DE SEGURIDAD! 🚨",
          "",
          "rm -rf /: ¿En serio? 😱",
          "",
          "Por suerte, esto es solo un portfolio...",
          "Si fuera un sistema real, acabas de:",
          "  • Borrar todo el sistema de archivos",
          "  • Destruir tu carrera profesional",
          "  • Convertirte en una leyenda urbana",
          "",
          "💡 Consejo profesional:",
          "   Nunca ejecutes 'rm -rf /' en un sistema real",
          "   A menos que quieras explicar a tu jefe",
          "   por qué el servidor desapareció... 🔥",
          "",
          "😄 Portfolio status: Intacto y a salvo!"
        ]
      };
    }
    
    // Para otros usos de rm
    if (args.length === 0) {
      return {
        output: ["rm: missing operand", "Try 'rm --help' for more information."]
      };
    }
    
    return {
      output: [`rm: cannot remove '${fullCommand}': This is a read-only portfolio terminal`]
    };
  }
};

// Si el usuario escribe un comando que no existe:
const defaultCommand: CommandFn = (args) => {
  const cmd = args.join(" ");
  const suggestions = Object.keys(COMMANDS)
    .filter(command => command.startsWith(cmd.charAt(0)))
    .slice(0, 3);
  
  const output = [`bash: ${cmd}: comando no encontrado`];
  
  if (suggestions.length > 0) {
    output.push("", "¿Quisiste decir?");
    suggestions.forEach(suggestion => {
      output.push(`  ${suggestion}`);
    });
  }
  
  output.push("", "Escribe 'help' para ver todos los comandos disponibles.");
  
  return { output };
};

export function runCommand(input: string): CommandResult {
  // Separamos en tokens: comando + argumentos
  const tokens = input.trim().split(/\s+/);
  const cmd = tokens[0].toLowerCase();
  const args = tokens.slice(1);

  if (cmd === "") {
    return { output: [""] }; // Enter sin nada, devolvemos línea en blanco
  }

  const fn = COMMANDS[cmd] || (() => defaultCommand([cmd, ...args]));
  return fn(args);
}

// Función para autocompletar comandos
export function getAutocompleteSuggestions(input: string): string[] {
  const availableCommands = Object.keys(COMMANDS);
  return availableCommands.filter(cmd => 
    cmd.toLowerCase().startsWith(input.toLowerCase())
  );
}
