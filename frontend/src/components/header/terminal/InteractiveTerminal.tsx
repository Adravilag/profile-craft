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
  
  // Referencias
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

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
        executeCommand();
        break;
        
      case "Tab":
        e.preventDefault();
        handleTabCompletion();
        break;
        
      case "ArrowUp":
        e.preventDefault();
        navigateHistory(-1);
        break;
        
      case "ArrowDown":
        e.preventDefault();
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

  // Ejecutar comando
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
      return;
    }

    // Ejecutar comando
    const result: CommandResult = runCommand(inputValue);
    
    // Crear entrada del historial
    const newEntry: HistoryEntry = {
      command: inputValue,
      output: result.output,
      timestamp: Date.now()
    };

    // Actualizar estados
    if (result.clearScreen) {
      setHistory([newEntry]);
    } else {
      setHistory(prev => [...prev, newEntry]);
    }
    
    // Agregar al historial de comandos si no está vacío y no es repetido
    if (inputValue && commandHistory[commandHistory.length - 1] !== inputValue) {
      setCommandHistory(prev => [...prev, inputValue]);
    }
    
    // Limpiar input y estados
    setCurrentInput("");
    setHistoryIndex(-1);
    setShowAutocomplete(false);
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
  };

  // Manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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

              {/* Mostrar output */}
              {entry.output.map((line, lineIndex) => (
                <div 
                  key={lineIndex} 
                  className="interactive-terminal-line"
                >
                  <div className="interactive-output-line">
                    {line}
                  </div>
                </div>
              ))}
            </div>
          ))}

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
              placeholder="Escribe un comando... (prueba 'help')"
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
