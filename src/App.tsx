import { useRef } from "react";
import "./App.css";
import RouletteSelector from "./components/RouletteSelector";

function App() {
  const selectorRef = useRef<HTMLInputElement>(null);
  const selectionOptions = {
    "R.A. Açores": ["Terceira", "Graciosa", "Pico", "São Jorge", "Faial", "Flores", "Corvo", "Santa Maria", "São Miguel"],
    "R.A. Madeira": ["Madeira", "Porto Santo"],
    "Região Norte": ["Porto", "Braga", "Bragança"],
    "Região Centro": ["Coimbra", "Aveiro", "Viseu"],
    "Região Sul": ["Beja"],
  };

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
