'use client';

import { useEffect, useState } from 'react';
import { genPlayerId } from './rooms';

const ID_KEY = 'uplevelkids-player-id';
const NAME_KEY = 'uplevelkids-player-name';

export function usePlayer() {
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerNameState] = useState<string>('');

  useEffect(() => {
    let id = localStorage.getItem(ID_KEY);
    if (!id) {
      id = genPlayerId();
      localStorage.setItem(ID_KEY, id);
    }
    setPlayerId(id);
    const name = localStorage.getItem(NAME_KEY) || '';
    setPlayerNameState(name);
  }, []);

  const setPlayerName = (name: string) => {
    localStorage.setItem(NAME_KEY, name);
    setPlayerNameState(name);
  };

  return { playerId, playerName, setPlayerName };
}
