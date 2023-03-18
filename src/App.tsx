import { useRef } from "react";
import "./App.css";
import BadRouletteSelector from "./components/BadRouletteSelector";

function App() {
  const selectorRef = useRef<HTMLInputElement>(null);
  const selectionOptions = {
    "R.A. Açores": [
      "Corvo",
      "Faial",
      "Flores",
      "Graciosa",
      "Pico",
      "Santa Maria",
      "São Jorge",
      "São Miguel",
      "Terceira",
    ],
    "R.A. Madeira": ["Madeira", "Porto Santo"],
    "Região Norte": [
      "Aveiro",
      "Braga",
      "Bragança",
      "Porto",
      "Viana do Castelo",
      "Vila Real",
    ],
    "Região Centro": [
      "Castelo Branco",
      "Coimbra",
      "Guarda",
      "undefined",
      "Santarém",
      "Viseu",
    ],
    "Região Sul": ["Beja", "Évora", "Faro", "Lisboa", "Portalegre", "Setúbal"],
  };

  return (
    <div className="App">
      <BadRouletteSelector ref={selectorRef} selectionOptions={selectionOptions} />
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
