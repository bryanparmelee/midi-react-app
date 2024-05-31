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

let currentSequenceId = -1;

const START = 41;

const intervals = [0, 4, 7, 11, 12, 11, 7, 4];
const sequence = intervals.map((x) => x + START);

const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;
const NOTE_DURATION = 300;

let isMidiLoaded = false;

function App() {
  useEffect(() => {
    if (!isMidiLoaded) {
      isMidiLoaded = true;
      navigator.requestMIDIAccess().then(onSuccess, onFailure);
    }
  }, []);

  const [inputs, setInputs] = useState<MIDIInput[]>([]);
  const [currentInput, setCurrentInput] = useState<MIDIInput | null>(null);
  const [outputs, setOutputs] = useState<MIDIOutput[]>([]);
  const [currentOutput, setCurrentOutput] = useState<MIDIOutput | null>(null);

  function onSuccess(MIDIAccess: MIDIAccess) {
    const inputArray = Array.from(MIDIAccess.inputs.values());
    const outputArray = Array.from(MIDIAccess.outputs.values());
    setInputs(inputArray);
    setOutputs(outputArray);
    setCurrentInput(inputArray[0]);
    setCurrentOutput(outputArray[0]);
    MIDIAccess.onstatechange = () => {
      const updatedInputArray = Array.from(MIDIAccess.inputs.values());
      const updateOutputArray = Array.from(MIDIAccess.outputs.values());
      setInputs(updatedInputArray);
      setOutputs(updateOutputArray);
      setCurrentInput(updatedInputArray[0]);
      setCurrentOutput(updateOutputArray[0]);
    };
  }

  function onFailure() {
    console.log("failed");
  }

  function handleInputChange(inputName: string) {
    const input = inputs.find((i) => i.name === inputName);
    if (input) setCurrentInput(input);
  }

  function handleOutputChange(outputName: string) {
    const output = outputs.find((o) => o.name === outputName);
    if (output) setCurrentOutput(output);
  }

  function handlePlay() {
    if (currentOutput) {
      if (currentSequenceId >= 0) {
        currentOutput.send([NOTE_OFF, sequence[currentSequenceId], 0x7f]);
      }

      currentSequenceId++;
      if (currentSequenceId >= sequence.length) {
        currentSequenceId = 0;
      }

      currentOutput.send([NOTE_ON, sequence[currentSequenceId], 0x7f]);

      setTimeout(handlePlay, NOTE_DURATION);
    }
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
      <button type="button" id="play" onClick={() => handlePlay()}>
        PLAY
      </button>
    </>
  );
}

export default App;
