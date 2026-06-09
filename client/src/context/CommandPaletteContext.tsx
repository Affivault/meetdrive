import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface CommandPaletteContextType {
  open: boolean;
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType | undefined>(undefined);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);
  const togglePalette = useCallback(() => setOpen((o) => !o), []);

  return (
    <CommandPaletteContext.Provider value={{ open, openPalette, closePalette, togglePalette }}>
      {children}
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (ctx === undefined) {
    throw new Error('useCommandPalette must be used within a CommandPaletteProvider');
  }
  return ctx;
}
