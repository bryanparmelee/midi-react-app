interface Props {
  type: string;
  list: MIDIInput[] | MIDIOutput[];
  handleChange: (e: string) => void;
}

const InputOutputList = ({ type, list, handleChange }: Props) => {
  return (
    <>
      {list.length > 0 && (
        <div>
          <label htmlFor="input-select">
            {type === "input" ? "Input: " : "Output: "}
          </label>
          <select
            name="inputs"
            id="input-select"
            onChange={(e) => handleChange(e.target.value)}
          >
            {list.map((input) => (
              <option value={input.name as string} key={input.id}>
                {input.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
};

export default InputOutputList;
