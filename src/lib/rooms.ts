import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteField,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { generateProblem, Operation, DifficultyLevel, Problem } from './math';

export type RoomStatus = 'waiting' | 'playing' | 'finished';

export interface RoomSettings {
  operation: Operation;
  difficulty: DifficultyLevel;
  tables?: number[];
  durationSec: number;
  problemCount: number;
}

export interface RoomPlayer {
  name: string;
  joinedAt: Timestamp | null;
  ready: boolean;
  correct: number;
  incorrect: number;
  bestStreak: number;
  finishedAt: Timestamp | null;
}

export interface Room {
  code: string;
  status: RoomStatus;
  hostId: string;
  settings: RoomSettings;
  problems: Problem[];
  players: Record<string, RoomPlayer>;
  createdAt: Timestamp | null;
  startedAt: Timestamp | null;
}

const COLLECTION = 'kids-rooms';

export const roomDoc = (code: string) => doc(db, COLLECTION, code);
export const roomsCol = () => collection(db, COLLECTION);

export const genRoomCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const genPlayerId = () => {
  return 'p_' + Math.random().toString(36).slice(2, 10);
};

export const genProblemSet = (settings: RoomSettings): Problem[] => {
  const out: Problem[] = [];
  for (let i = 0; i < settings.problemCount; i++) {
    out.push(generateProblem(settings.operation, settings.difficulty, settings.tables));
  }
  return out;
};

export const createRoom = async (
  hostId: string,
  hostName: string,
  settings: RoomSettings
): Promise<string> => {
  // Try a few codes in case of collision
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = genRoomCode();
    const snap = await getDoc(roomDoc(code));
    if (snap.exists()) continue;

    const room: Omit<Room, 'createdAt' | 'startedAt'> & { createdAt: any; startedAt: any } = {
      code,
      status: 'waiting',
      hostId,
      settings,
      problems: genProblemSet(settings),
      players: {
        [hostId]: {
          name: hostName,
          joinedAt: null,
          ready: false,
          correct: 0,
          incorrect: 0,
          bestStreak: 0,
          finishedAt: null,
        },
      },
      createdAt: serverTimestamp(),
      startedAt: null,
    };

    await setDoc(roomDoc(code), room);
    return code;
  }
  throw new Error('Could not allocate room code');
};

export const joinRoom = async (code: string, playerId: string, playerName: string) => {
  const ref = roomDoc(code);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('ห้องไม่พบ');
  const data = snap.data() as Room;
  if (data.status !== 'waiting') throw new Error('ห้องเริ่มแล้วหรือจบแล้ว');
  const playerCount = Object.keys(data.players || {}).length;
  if (playerCount >= 2 && !(playerId in (data.players || {}))) {
    throw new Error('ห้องเต็ม');
  }

  await updateDoc(ref, {
    [`players.${playerId}`]: {
      name: playerName,
      joinedAt: serverTimestamp(),
      ready: false,
      correct: 0,
      incorrect: 0,
      bestStreak: 0,
      finishedAt: null,
    },
  });
};

export const setReady = async (code: string, playerId: string, ready: boolean) => {
  await updateDoc(roomDoc(code), {
    [`players.${playerId}.ready`]: ready,
  });
};

export const startRoom = async (code: string) => {
  await updateDoc(roomDoc(code), {
    status: 'playing',
    startedAt: serverTimestamp(),
  });
};

export const updateProgress = async (
  code: string,
  playerId: string,
  correct: number,
  incorrect: number,
  bestStreak: number
) => {
  await updateDoc(roomDoc(code), {
    [`players.${playerId}.correct`]: correct,
    [`players.${playerId}.incorrect`]: incorrect,
    [`players.${playerId}.bestStreak`]: bestStreak,
  });
};

export const finishPlayer = async (code: string, playerId: string) => {
  await updateDoc(roomDoc(code), {
    [`players.${playerId}.finishedAt`]: serverTimestamp(),
  });
};

export const setRoomFinished = async (code: string) => {
  await updateDoc(roomDoc(code), { status: 'finished' });
};

export const leaveRoom = async (code: string, playerId: string) => {
  await updateDoc(roomDoc(code), {
    [`players.${playerId}`]: deleteField(),
  });
};
