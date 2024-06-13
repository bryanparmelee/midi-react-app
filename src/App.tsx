import { useEffect, useRef, useState } from "react";
import InputOutputList from "./Components/InputOutputList";

import { parseMIDI, keyToMidi } from "./constants";
import { MIDIInfo } from "./types";

let currentSequenceId = -1;

const START = 41;

const intervals = [0, 4, 7, 11, 12, 11, 7, 4];
const sequence = intervals.map((x) => x + START);

const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;
const NOTE_DURATION = 300;

const tempo = 120;

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
  const [currentNotes, setCurrentNotes] = useState<number[]>([1]);
  const [isArpeggiatorOn, setIsArpeggiatorOn] = useState<boolean>(false);
  const outputRef = useRef<MIDIOutput | null>(currentOutput);

  useEffect(() => {
    if (currentInput) currentInput.onmidimessage = handleMIDI;
  }, [currentInput]);

  useEffect(() => {
    console.log(currentNotes);
  }, [currentNotes]);

  const onKeyPress = (ev: KeyboardEvent): void => {
    if (keyToMidi[ev.key]) {
      processMIDI({
        command: 9,
        channel: 0,
        note: keyToMidi[ev.key],
        velocity: 100,
      });
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", onKeyPress);
  }, []);

  function onSuccess(MIDIAccess: MIDIAccess) {
    const inputArray = Array.from(MIDIAccess.inputs.values());
    const outputArray = Array.from(MIDIAccess.outputs.values());
    setInputs(inputArray);
    setOutputs(outputArray);
    setCurrentInput(inputArray[0]);
    setCurrentOutput(outputArray[0]);
    if (!outputRef.current) outputRef.current = outputArray[0];
    MIDIAccess.onstatechange = () => {
      const updatedInputArray = Array.from(MIDIAccess.inputs.values());
      const updateOutputArray = Array.from(MIDIAccess.outputs.values());
      setInputs(updatedInputArray);
      setOutputs(updateOutputArray);
      setCurrentInput(updatedInputArray[0]);
      setCurrentOutput(updateOutputArray[0]);
      if (!outputRef.current) outputRef.current = outputArray[0];
    };
  }

  function onFailure() {
    console.log("failed");
  }

  const processMIDI = (midi: MIDIInfo) => {
    const { command, channel, note, velocity } = midi;
    if (isArpeggiatorOn) {
      console.log("arp is on!");
      if (command === 9 && channel === 0) {
        arpeggiateNote(note);
      }
    } else {
      if (command === 8) {
        if (channel === 0) onNote(NOTE_OFF, note, -velocity / 127);
      } else if (command === 9) {
        console.log("arp is off!");
        if (channel === 0) onNote(NOTE_ON, note, velocity);
      }
    }
  };

  function handleMIDI(message: MIDIMessageEvent) {
    const midiInfo = parseMIDI(message);
    if (midiInfo) processMIDI(midiInfo);
  }

  function onNote(status: number, note: number, velocity: number): void {
    if (outputRef.current) {
      console.log(outputRef.current.name, status, note, velocity);
      outputRef.current.send([status, note, velocity]);
    }
  }

  function arpeggiateNote(note: number) {
    if (currentNotes.includes(note)) {
      setCurrentNotes(currentNotes.filter((n) => n !== note));
    } else {
      setCurrentNotes([...currentNotes, note]);
    }
  }

  function handleInputChange(inputName: string) {
    const input = inputs.find((i) => i.name === inputName);
    if (input) setCurrentInput(input);
  }

  function handleOutputChange(outputName: string) {
    const output = outputs.find((o) => o.name === outputName);
    if (output) {
      setCurrentOutput(output);
      outputRef.current = output;
    }
  }

  function handleArpToggle() {
    setIsArpeggiatorOn(!isArpeggiatorOn);
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
      <button type="button" id="arp-toggle" onClick={handleArpToggle}>
        Arpeggiator
      </button>
    </>
  );
}

export default App;
