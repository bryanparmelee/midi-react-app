import { MIDIInfo } from "./types";

export const noteNames = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export const keyToMidi: { [key: string]: number } = {
  a: 60,
  w: 61,
  s: 62,
  e: 63,
  d: 64,
  f: 65,
  t: 66,
  g: 67,
  y: 68,
  h: 69,
  u: 70,
  j: 71,
  k: 72,
  o: 73,
  l: 74,
  p: 75,
  ";": 76,
  "'": 77,
};

export function parseMIDI(message: MIDIMessageEvent): MIDIInfo | undefined {
  if (message.data) {
    return {
      command: message.data[0] >> 4,
      channel: message.data[0] & 0xf,
      note: message.data[1],
      velocity: message.data.length > 2 ? message.data[2] : 0,
    };
  }
  return;
}

export function findNote(note: number): string {
  const octave = Math.floor(note / 12 - 2);
  const noteIndex = note % 12;
  return noteNames[noteIndex] + octave.toString();
}
