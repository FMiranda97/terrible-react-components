import { useRef } from "react";
import "./App.css";
import RouletteSelector from "./components/RouletteSelector";

function App() {
  const selectorRef = useRef<HTMLInputElement>(null);
  const selectionOptions = [
    "R.A. Açores",
    "R.A. Madeira",
    "Região Norte",
    "Região Centro",
    "Região Sul",
  ];

  return (
    <div className="App">
      <RouletteSelector ref={selectorRef} selectionOptions={selectionOptions} />
      <button
        onClick={() => {
          alert(selectorRef.current?.value);
        }}
      >
        Confirm
      </button>
    </div>
  );
}

export default App;
