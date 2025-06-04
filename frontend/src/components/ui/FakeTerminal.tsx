import React, { useState, useEffect, useRef } from 'react';
import './FakeTerminal.css';

export interface TerminalCommand {
  command: string;
  output?: string[];
  delay?: number;
  type?: 'command' | 'output' | 'error' | 'success';
}

interface FakeTerminalProps {
  commands: TerminalCommand[];
  title?: string;
  theme?: 'dark' | 'light' | 'matrix' | 'retro';
  autoStart?: boolean;
  loop?: boolean;
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

const FakeTerminal: React.FC<FakeTerminalProps> = ({
  commands,
  title = 'Terminal',
  theme = 'dark',
  autoStart = true,
  loop = false,
  speed = 'normal',
  className = ''
}) => {
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [displayedCommands, setDisplayedCommands] = useState<TerminalCommand[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const speedMap = {
    slow: 100,
    normal: 50,
    fast: 25
  };

  const typeSpeed = speedMap[speed];

  // Auto scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [displayedCommands, currentCharIndex]);

  // Start animation
  useEffect(() => {
    if (autoStart && commands.length > 0) {
      startAnimation();
    }
  }, [autoStart, commands]);

  const startAnimation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setCurrentCommandIndex(0);
    setCurrentCharIndex(0);
    setDisplayedCommands([]);
    typeNextCommand();
  };

  const typeNextCommand = () => {
    if (currentCommandIndex >= commands.length) {
      if (loop) {
        setTimeout(() => {
          setCurrentCommandIndex(0);
          setCurrentCharIndex(0);
          setDisplayedCommands([]);
          typeNextCommand();
        }, 2000);
      } else {
        setIsRunning(false);
      }
      return;
    }

    const currentCommand = commands[currentCommandIndex];
    setIsTyping(true);

    // Type the command
    const typeCommand = () => {
      const command = currentCommand.command;
      if (currentCharIndex <= command.length) {
        const typedCommand = command.substring(0, currentCharIndex);
        
        setDisplayedCommands(prev => {
          const newCommands = [...prev];
          newCommands[currentCommandIndex] = {
            ...currentCommand,
            command: typedCommand
          };
          return newCommands;
        });

        setCurrentCharIndex(prev => prev + 1);
        
        if (currentCharIndex < command.length) {
          setTimeout(typeCommand, typeSpeed);
        } else {
          // Command typed, now show output
          setTimeout(() => {
            showOutput();
          }, currentCommand.delay || 500);
        }
      }
    };

    // Initialize the command in displayedCommands
    setDisplayedCommands(prev => [...prev, { ...currentCommand, command: '' }]);
    typeCommand();
  };

  const showOutput = () => {
    const currentCommand = commands[currentCommandIndex];
    
    if (currentCommand.output) {
      setDisplayedCommands(prev => {
        const newCommands = [...prev];
        newCommands[currentCommandIndex] = {
          ...currentCommand,
          output: currentCommand.output
        };
        return newCommands;
      });
    }

    setIsTyping(false);
    
    // Move to next command
    setTimeout(() => {
      setCurrentCommandIndex(prev => prev + 1);
      setCurrentCharIndex(0);
      typeNextCommand();
    }, 800);
  };

  const restartAnimation = () => {
    setIsRunning(false);
    setTimeout(() => startAnimation(), 100);
  };

  return (
    <div className={`fake-terminal ${theme} ${className}`} ref={terminalRef}>
      {/* Terminal Header */}
      <div className="terminal-header">
        <div className="terminal-controls">
          <div className="terminal-button close"></div>
          <div className="terminal-button minimize"></div>
          <div className="terminal-button maximize"></div>
        </div>
        <div className="terminal-title">{title}</div>
        <div className="terminal-actions">
          <button 
            className="terminal-restart-btn"
            onClick={restartAnimation}
            disabled={isRunning}
          >
            <i className="fas fa-redo"></i>
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="terminal-body" ref={outputRef}>
        <div className="terminal-output">
          {displayedCommands.map((cmd, index) => (
            <div key={index} className="terminal-line">
              {/* Command Line */}
              <div className="command-line">
                <span className="terminal-prompt">
                  <span className="user">user</span>
                  <span className="at">@</span>
                  <span className="host">dev</span>
                  <span className="separator">:</span>
                  <span className="path">~</span>
                  <span className="dollar">$</span>
                </span>
                <span className="command-text">{cmd.command}</span>
                {index === currentCommandIndex && isTyping && (
                  <span className="cursor blinking">|</span>
                )}
              </div>

              {/* Command Output */}
              {cmd.output && cmd.output.map((line, lineIndex) => (
                <div 
                  key={lineIndex} 
                  className={`output-line ${cmd.type || 'output'}`}
                >
                  {line}
                </div>
              ))}
            </div>
          ))}

          {/* Idle cursor when not running */}
          {!isRunning && displayedCommands.length > 0 && (
            <div className="terminal-line">
              <span className="terminal-prompt">
                <span className="user">user</span>
                <span className="at">@</span>
                <span className="host">dev</span>
                <span className="separator">:</span>
                <span className="path">~</span>
                <span className="dollar">$</span>
              </span>
              <span className="cursor blinking">|</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FakeTerminal;
