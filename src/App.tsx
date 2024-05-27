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
  const [currentNotes, setCurrentNotes] = useState([]);

  navigator.requestMIDIAccess().then(onSuccess, onFailure);

  function onSuccess(MIDIAccess: MIDIAccess) {
    for (const input of MIDIAccess.inputs.values()) {
      input.onmidimessage = getMIDIMessage;
    }
  }

  function onFailure() {
    console.log("failed");
  }

  function findNote(note: number): string {
    const octave = Math.floor(note / 12 - 2);
    const noteIndex = note % 12;
    return noteNames[noteIndex] + octave.toString();
  }

  function noteOn(note: number) {}

  function noteOff(note) {}

  function getMIDIMessage(message: MIDIMessageEvent) {
    if (message.data) {
      const command = message.data[0];
      const note = message.data[1];
      const velocity = message.data.length > 2 ? message.data[2] : 0;

      switch (command) {
        case 144:
          if (velocity > 0) {
            noteOn(note);
          } else {
            noteOff(note);
          }
          break;
        case 128:
          noteOff(note);
          break;
      }
    }
  }

  return (
    <>
      <h2>MIDI React App</h2>
      <div>
        {currentNotes.length ? (
          currentNotes.map((note) => <p>{note}</p>)
        ) : (
          <p>—</p>
        )}
      </div>
    </>
  );
}

export default App;
