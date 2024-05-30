import { useState } from "react";

const noteNames = [
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

function App() {
  let midiOutput: MIDIOutput | null = null;
  let midiInput: MIDIInput | null = null;
  let inputs: MIDIInput[] | [] = [];
  let outputs: MIDIOutput[] | [] = [];

  const NOTE_ON = 0x90;
  const NOTE_OFF = 0x80;

  const [currentNotes, setCurrentNotes] = useState<string[]>([]);

  navigator.requestMIDIAccess().then(onSuccess, onFailure);

  function onSuccess(MIDIAccess: MIDIAccess) {
    outputs = Array.from(MIDIAccess.outputs.values());
    console.log(outputs);

    inputs = Array.from(MIDIAccess.inputs.values());
    console.log(inputs);
  }

  function onFailure() {
    console.log("failed");
  }

  function findNote(note: number): string {
    const octave = Math.floor(note / 12 - 2);
    const noteIndex = note % 12;
    return noteNames[noteIndex] + octave.toString();
  }

  return (
    <>
      <h2>MIDI React App</h2>
    </>
  );
}

export default App;
