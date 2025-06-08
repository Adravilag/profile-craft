// src/components/terminal/InteractiveTerminal.tsx

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { runCommand, CommandResult, getAutocompleteSuggestions } from "./commands";
import "./terminal.css";

interface HistoryEntry {
  command: string;
  output: string[];
  timestamp: number;
}

const InteractiveTerminal: React.FC = () => {
  // Estados principales
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Estados para autocompletado
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  
  // Estados para efectos typewriter
  const [typewriterQueue, setTypewriterQueue] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [typewriterActive, setTypewriterActive] = useState(false);
  const [specialEffect, setSpecialEffect] = useState<'normal' | 'hack' | 'glitch' | 'undertale'>('normal');
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [userScrolling, setUserScrolling] = useState(false);
  
  // Referencias
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Función para crear sonidos de tecleo con variedad (incluyendo estilo Undertale)
  const playKeySound = (type: 'key' | 'enter' | 'tab' | 'arrow' | 'typewriter' | 'hack' | 'undertale' = 'key') => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        return; // Audio not supported
      }
    }

    try {
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Diferentes sonidos según el tipo de tecla
      let frequency = 800;
      let duration = 0.1;
      let volume = 0.05;
      let waveType: OscillatorType = 'square';
      
      switch (type) {
        case 'enter':
          frequency = 600;
          duration = 0.15;
          volume = 0.08;
          break;
        case 'tab':
          frequency = 1000;
          duration = 0.12;
          volume = 0.06;
          break;
        case 'arrow':
          frequency = 900;
          duration = 0.08;
          volume = 0.04;
          break;
        case 'typewriter':
          // Sonido más suave para el typewriter carácter por carácter
          frequency = 600 + Math.random() * 300;
          duration = 0.05;
          volume = 0.03;
          waveType = 'sine';
          break;
        case 'hack':
          // Sonido más agresivo para el comando hack
          frequency = 400 + Math.random() * 800;
          duration = 0.08;
          volume = 0.06;
          waveType = 'sawtooth';
          break;
        case 'undertale':
          // Sonido estilo Undertale - más musical
          const notes = [440, 493.88, 523.25, 587.33, 659.25]; // A, B, C, D, E
          frequency = notes[Math.floor(Math.random() * notes.length)];
          duration = 0.1;
          volume = 0.04;
          waveType = 'triangle';
          break;
        default:
          frequency = 800 + Math.random() * 200; // Variedad para teclas normales
      }
      
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.type = waveType;
      
      // Configurar volumen y envolvente
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      // Silently fail if audio doesn't work
    }
  };

  // Función para hacer scroll suave hacia abajo con delay inteligente
  const scrollToBottom = (delay: number = 0, force: boolean = false) => {
    setTimeout(() => {
      if (outputRef.current && (!userScrolling || force)) {
        const element = outputRef.current;
        const isNearBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 50;
        
        // Solo hacer scroll automático si está cerca del final o es forzado
        if (isNearBottom || force) {
          element.scrollTo({
            top: element.scrollHeight,
            behavior: delay > 0 ? 'smooth' : 'auto' // Auto para scroll rápido durante typewriter
          });
        }
      }
    }, delay);
  };

  // Mensaje de bienvenida
  useEffect(() => {
    const welcomeEntry: HistoryEntry = {
      command: "",
      output: [
        "🖥️  Terminal Interactiva - CV Adrián Dávila",
        "",
        "¡Bienvenido! Esta es una terminal completamente funcional.",
        "Puedes escribir comandos para explorar mi perfil profesional.",
        "",
        "💡 Consejos:",
        "  • Escribe 'help' para ver todos los comandos disponibles",
        "  • Usa Tab para autocompletar comandos",
        "  • Usa ↑↓ para navegar por el historial de comandos",
        "  • Escribe 'clear' para limpiar la pantalla",
        "",
        "🚀 ¡Comienza escribiendo 'about' para conocer más sobre mí!",
        ""
      ],
      timestamp: Date.now()
    };
    
    setHistory([welcomeEntry]);
  }, []);

  // Auto scroll al final cuando cambia el historial
  useEffect(() => {
    scrollToBottom(0, true); // Forzar scroll al cambiar historial
  }, [history]);

  // Detectar scroll manual del usuario
  useEffect(() => {
    const handleScroll = () => {
      if (outputRef.current) {
        const element = outputRef.current;
        const isNearBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 50;
        setUserScrolling(!isNearBottom);
      }
    };

    const outputElement = outputRef.current;
    if (outputElement) {
      outputElement.addEventListener('scroll', handleScroll);
      return () => outputElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Efecto typewriter carácter por carácter estilo Undertale
  useEffect(() => {
    if (typewriterQueue.length > 0 && !typewriterActive) {
      setTypewriterActive(true);
      setCurrentLineIndex(0);
      setCurrentCharIndex(0);
      setCurrentLine("");
      
      let currentLine = 0;
      let currentChar = 0;
      
      const processNextChar = () => {
        if (currentLine >= typewriterQueue.length) {
          // Todas las líneas completadas
          setTypewriterActive(false);
          const completedEntry = {
            command: '',
            output: typewriterQueue,
            timestamp: Date.now()
          };            setHistory(prev => [...prev, completedEntry]);
            setTypewriterQueue([]);
            setSpecialEffect('normal');
            scrollToBottom(100, true); // Forzar scroll al completar
          return;
        }
        
        const currentLineText = typewriterQueue[currentLine] || "";
        
        if (currentChar < currentLineText.length) {
          // Agregar el siguiente carácter
          const nextChar = currentLineText[currentChar];
          setCurrentLine(prev => prev + nextChar);
          setCurrentCharIndex(currentChar + 1);
          
          // Reproducir sonido según el efecto especial
          const soundType = specialEffect === 'undertale' ? 'undertale' : 
                           specialEffect === 'hack' ? 'hack' : 'typewriter';
          playKeySound(soundType);
          
          // Hacer scroll mientras se va escribiendo
          scrollToBottom(0);
          
          currentChar++;
          
          // Continuar con el siguiente carácter
          const delay = specialEffect === 'undertale' ? 60 + Math.random() * 40 : // 60-100ms para Undertale
                       specialEffect === 'hack' ? 30 + Math.random() * 20 : // 30-50ms para hack
                       15 + Math.random() * 15; // 15-30ms para comandos normales (más rápido)
          
          setTimeout(processNextChar, delay);
        } else {
          // Línea completada, pasar a la siguiente
          currentLine++;
          currentChar = 0;
          setCurrentLineIndex(currentLine);
          setCurrentCharIndex(0);
          setCurrentLine("");
          
          // Hacer scroll al completar cada línea
          scrollToBottom(0);
          
          if (currentLine < typewriterQueue.length) {
            setTimeout(processNextChar, 200); // Pausa entre líneas
          } else {
            // Todas las líneas completadas
            setTypewriterActive(false);
            const completedEntry = {
              command: '',
              output: typewriterQueue,
              timestamp: Date.now()
            };
            setHistory(prev => [...prev, completedEntry]);
            setTypewriterQueue([]);
            setSpecialEffect('normal');
            scrollToBottom(100, true); // Forzar scroll al completar
          }
        }
      };
      
      processNextChar();
    }
  }, [typewriterQueue]); // Solo depende de typewriterQueue

  // Efecto typewriter fallback eliminado - ahora todo usa caracter por caracter

  // Enfocar el input cuando se monta el componente
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Manejar entrada de comandos
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        playKeySound('enter'); // Sonido especial al presionar Enter
        executeCommand();
        break;
        
      case "Tab":
        e.preventDefault();
        playKeySound('tab'); // Sonido especial al presionar Tab
        handleTabCompletion();
        break;
        
      case "ArrowUp":
        e.preventDefault();
        playKeySound('arrow'); // Sonido especial al navegar historial
        navigateHistory(-1);
        break;
        
      case "ArrowDown":
        e.preventDefault();
        playKeySound('arrow'); // Sonido especial al navegar historial
        navigateHistory(1);
        break;
        
      case "Escape":
        setShowAutocomplete(false);
        break;
        
      case "ArrowDown":
      case "ArrowUp":
        if (showAutocomplete) {
          e.preventDefault();
          navigateAutocomplete(e.key === "ArrowDown" ? 1 : -1);
        }
        break;
    }
  };

  // Ejecutar comando con efecto typewriter
  const executeCommand = () => {
    const inputValue = currentInput.trim();
    
    if (inputValue === "") {
      // Enter sin comando, solo agregar línea vacía
      const emptyEntry: HistoryEntry = {
        command: "",
        output: [""],
        timestamp: Date.now()
      };
      setHistory(prev => [...prev, emptyEntry]);
      scrollToBottom(0, true);
      return;
    }

    // Mostrar indicador de "escribiendo..."
    setShowTypingIndicator(true);
    
    // Simular un pequeño delay para el procesamiento
    setTimeout(() => {
      // Ejecutar comando
      const result: CommandResult = runCommand(inputValue);
      
      // Detectar comandos especiales para efectos
      if (inputValue.toLowerCase() === 'hack') {
        setSpecialEffect('hack');
      } else if (inputValue.toLowerCase() === 'undertale') {
        setSpecialEffect('undertale');
      } else if (inputValue.toLowerCase().includes('matrix')) {
        setSpecialEffect('undertale'); // Usar efecto undertale para matrix también
      } else {
        setSpecialEffect('normal');
      }
      
      // Crear entrada del historial con solo el comando
      const commandOnlyEntry: HistoryEntry = {
        command: inputValue,
        output: [],
        timestamp: Date.now()
      };

      // Actualizar estados - solo agregar el comando sin output
      if (result.clearScreen) {
        setHistory([commandOnlyEntry]);
      } else {
        setHistory(prev => [...prev, commandOnlyEntry]);
      }
      
      // TODOS los comandos usan typewriter caracter por caracter
      setTypewriterQueue(result.output);
      
      // Ocultar indicador de escribiendo
      setShowTypingIndicator(false);
      
      // Agregar al historial de comandos si no está vacío y no es repetido
      if (inputValue && commandHistory[commandHistory.length - 1] !== inputValue) {
        setCommandHistory(prev => [...prev, inputValue]);
      }
      
      // Limpiar input y estados
      setCurrentInput("");
      setHistoryIndex(-1);
      setShowAutocomplete(false);
      
      // El scroll se manejará cuando termine el typewriter
    }, 100 + Math.random() * 200); // Delay aleatorio entre 100-300ms
  };

  // Manejar autocompletado con Tab
  const handleTabCompletion = () => {
    if (currentInput.trim() === "") return;
    
    const suggestions = getAutocompleteSuggestions(currentInput);
    
    if (suggestions.length === 1) {
      // Solo una opción, completar automáticamente
      setCurrentInput(suggestions[0] + " ");
      setShowAutocomplete(false);
    } else if (suggestions.length > 1) {
      // Múltiples opciones, mostrar lista
      setAutocompleteOptions(suggestions);
      setSelectedSuggestion(0);
      setShowAutocomplete(true);
    }
  };

  // Navegar por el historial de comandos
  const navigateHistory = (direction: number) => {
    if (commandHistory.length === 0) return;
    
    const newIndex = historyIndex + direction;
    
    if (newIndex >= -1 && newIndex < commandHistory.length) {
      setHistoryIndex(newIndex);
      
      if (newIndex === -1) {
        setCurrentInput("");
      } else {
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    }
  };

  // Navegar por opciones de autocompletado
  const navigateAutocomplete = (direction: number) => {
    if (!showAutocomplete || autocompleteOptions.length === 0) return;
    
    const newIndex = selectedSuggestion + direction;
    
    if (newIndex >= 0 && newIndex < autocompleteOptions.length) {
      setSelectedSuggestion(newIndex);
    }
  };

  // Seleccionar sugerencia de autocompletado
  const selectSuggestion = (suggestion: string) => {
    setCurrentInput(suggestion + " ");
    setShowAutocomplete(false);
    inputRef.current?.focus();
  };

  // Limpiar terminal
  const clearTerminal = () => {
    setHistory([]);
    setCurrentInput("");
    setCommandHistory([]);
    setHistoryIndex(-1);
    setShowAutocomplete(false);
    setTypewriterQueue([]);
    setShowTypingIndicator(false);
    setTypewriterActive(false);
    setSpecialEffect('normal');
    setCurrentLine("");
    setCurrentLineIndex(0);
    setCurrentCharIndex(0);
    setUserScrolling(false);
    scrollToBottom(0, true);
  };

  // Manejar cambios en el input con sonidos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const prevLength = currentInput.length;
    const newLength = value.length;
    
    // Solo reproducir sonido si se agregó un carácter (no al borrar)
    if (newLength > prevLength) {
      playKeySound();
    }
    
    setCurrentInput(value);
    
    // Actualizar autocompletado en tiempo real
    if (value.trim()) {
      const suggestions = getAutocompleteSuggestions(value.trim());
      if (suggestions.length > 1) {
        setAutocompleteOptions(suggestions);
        setSelectedSuggestion(0);
        setShowAutocomplete(true);
      } else {
        setShowAutocomplete(false);
      }
    } else {
      setShowAutocomplete(false);
    }
  };

  return (
    <div className="interactive-terminal-container">
      {/* Terminal Header */}
      <div className="interactive-terminal-header">
        <div className="interactive-terminal-controls">
          <div className="interactive-terminal-button close"></div>
          <div className="interactive-terminal-button minimize"></div>
          <div className="interactive-terminal-button maximize"></div>
        </div>
        <div className="interactive-terminal-title">
          Terminal Interactiva - CV Adrián Dávila
        </div>
        <div className="interactive-terminal-actions">
          <button 
            className="interactive-terminal-clear-btn"
            onClick={clearTerminal}
            title="Limpiar terminal"
          >
            <i className="fas fa-broom"></i> Clear
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="interactive-terminal-body" ref={outputRef}>
        <div className="interactive-terminal-output">
          {/* Historial de comandos */}
          {history.map((entry, index) => (
            <div key={index} className="interactive-history-item">
              {/* Mostrar comando si no está vacío */}
              {entry.command && (
                <div className="interactive-terminal-line">
                  <div className="interactive-command-line">
                    <span className="interactive-terminal-prompt">
                      <span className="user">adrian</span>
                      <span className="at">@</span>
                      <span className="host">dev</span>
                      <span className="separator">:</span>
                      <span className="path">~</span>
                      <span className="dollar">$</span>
                    </span>
                    <span className="command-text">{entry.command}</span>
                  </div>
                </div>
              )}

              {/* Mostrar output con animación línea por línea o typewriter */}
              {entry.output.map((line, lineIndex) => (
                <div 
                  key={lineIndex} 
                  className="interactive-terminal-line"
                >
                  <div className="interactive-output-line line-reveal">
                    {line}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Output en progreso con typewriter caracter por caracter */}
          {typewriterActive && (
            <div className={`interactive-history-item typewriter-active ${specialEffect === 'hack' ? 'hack-effect' : specialEffect === 'undertale' ? 'undertale-effect' : ''}`}>
              {/* Líneas ya completadas */}
              {typewriterQueue.slice(0, currentLineIndex).map((line, lineIndex) => (
                <div key={lineIndex} className="interactive-terminal-line">
                  <div className={`interactive-output-line ${specialEffect === 'hack' ? 'hack-effect' : specialEffect === 'undertale' ? 'undertale-effect' : ''}`}>
                    {line}
                  </div>
                </div>
              ))}
              
              {/* Línea actual siendo escrita */}
              {currentLineIndex < typewriterQueue.length && (
                <div className="interactive-terminal-line">
                  <div className={`interactive-output-line typewriter-current ${specialEffect === 'hack' ? 'hack-effect' : specialEffect === 'undertale' ? 'undertale-effect' : ''}`}>
                    {currentLine}
                    <span className="typewriter-cursor">|</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Indicador de "escribiendo..." */}
          {showTypingIndicator && (
            <div className="interactive-terminal-line">
              <div className="interactive-output-line typing-indicator">
                <span className="typing-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
                <span className="typing-text">procesando comando...</span>
              </div>
            </div>
          )}

          {/* Línea de input actual */}
          <div className="interactive-current-input">
            <span className="interactive-terminal-prompt">
              <span className="user">adrian</span>
              <span className="at">@</span>
              <span className="host">dev</span>
              <span className="separator">:</span>
              <span className="path">~</span>
              <span className="dollar">$</span>
            </span>
            <input
              ref={inputRef}
              type="text"
              className="interactive-terminal-input"
              value={currentInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={showTypingIndicator ? "Procesando..." : "Escribe un comando... (prueba 'help')"}
              disabled={showTypingIndicator}
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
            
            {/* Autocompletado */}
            {showAutocomplete && autocompleteOptions.length > 0 && (
              <div className="interactive-autocomplete">
                {autocompleteOptions.map((option, index) => (
                  <div
                    key={option}
                    className={`interactive-autocomplete-item ${
                      index === selectedSuggestion ? 'selected' : ''
                    }`}
                    onClick={() => selectSuggestion(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveTerminal;
