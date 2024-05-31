import { useEffect, useState } from "react";
import InputOutputList from "./Components/InputOutputList";

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

let isMidiLoaded = false;

function App() {
  useEffect(() => {
    if (!isMidiLoaded) {
      isMidiLoaded = true;
      navigator.requestMIDIAccess().then(onSuccess, onFailure);
    }
  }, []);

  const NOTE_ON = 0x90;
  const NOTE_OFF = 0x80;

  const [currentNotes, setCurrentNotes] = useState<string[]>([]);
  const [inputs, setInputs] = useState<MIDIInput[]>([]);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [outputs, setOutputs] = useState<MIDIOutput[]>([]);
  const [currentOutput, setCurrentOutput] = useState<string>("");

  function onSuccess(MIDIAccess: MIDIAccess) {
    console.log("success!");
    setInputs(Array.from(MIDIAccess.inputs.values()));
    setOutputs(Array.from(MIDIAccess.outputs.values()));
  }

  function onFailure() {
    console.log("failed");
  }

  function handleInputChange(input: string) {
    console.log(input);
    setCurrentInput(input);
  }

  function handleOutputChange(output: string) {
    console.log(output);
    setCurrentOutput(output);
  }

  function findNote(note: number): string {
    const octave = Math.floor(note / 12 - 2);
    const noteIndex = note % 12;
    return noteNames[noteIndex] + octave.toString();
  }

  return (
    <>
      <h2>MIDI React App</h2>
      {inputs.length > 0 && (
        <InputOutputList
          type="input"
          list={inputs}
          handleChange={handleInputChange}
        />
      )}
      <br />
      {outputs.length > 0 && (
        <InputOutputList
          type="output"
          list={outputs}
          handleChange={handleOutputChange}
        />
      )}
    </>
  );
}

export default App;
