import { useState, useEffect } from 'react';
import type { CommandData } from '../CommandBuilder';

export function useLocalStorage() {
  const [localCommands, setLocalCommands] = useState<CommandData[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('minecraftCommands');
    if (saved) {
      try {
        setLocalCommands(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse saved commands:', error);
      }
    }
  }, []);

  const saveCommand = (command: CommandData) => {
    const updated = [...localCommands, { ...command, id: Date.now().toString() }];
    setLocalCommands(updated);
    localStorage.setItem('minecraftCommands', JSON.stringify(updated));
  };

  const removeCommand = (id: string) => {
    const updated = localCommands.filter(cmd => (cmd as any).id !== id);
    setLocalCommands(updated);
    localStorage.setItem('minecraftCommands', JSON.stringify(updated));
  };

  const updateCommand = (id: string, command: CommandData) => {
    const updated = localCommands.map(cmd => 
      (cmd as any).id === id ? { ...command, id } : cmd
    );
    setLocalCommands(updated);
    localStorage.setItem('minecraftCommands', JSON.stringify(updated));
  };

  return {
    localCommands,
    saveCommand,
    removeCommand,
    updateCommand
  };
}
