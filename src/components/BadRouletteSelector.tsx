import React, { useCallback } from "react";
import { useEffect, useRef, useState } from "react";

import "./RouletteSelector.css";

type Props = {
  selectionOptions?: any;
  size?: number;
  height?: number;
  backgroundColor?: string;
  font?: string;
  label?: string;
};

const diameter_box_proportion = 15 / 16;
const selected_diameter_box_proportion = 31 / 32;
const middle_diameter_box_proportion = 1 / 4;

const radius_box_proportion = diameter_box_proportion / 2;
const selected_radius_box_proportion = selected_diameter_box_proportion / 2;
const middle_radius_box_proportion = middle_diameter_box_proportion / 2;

const button_radius_box_proportion = (middle_radius_box_proportion * 7) / 8;

function clear(ctx: CanvasRenderingContext2D, size: number) {
  ctx.clearRect(0, 0, size, size);
}

function drawBackground(ctx: CanvasRenderingContext2D, size: number) {
  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * radius_box_proportion, 0, 2 * Math.PI);
  ctx.fill();
}

function drawSectors(ctx: CanvasRenderingContext2D, size: number, n: number) {
  if (n < 2) return;
  ctx.strokeStyle = "white";
  ctx.lineWidth = 4;
  const step = (2 * Math.PI) / n;
  for (let i = 0; i < n; i++) {
    const angle = i * step - Math.PI / 2;
    const x = size / 2 + Math.cos(angle) * size * radius_box_proportion;
    const y = size / 2 + Math.sin(angle) * size * radius_box_proportion;
    ctx.beginPath();
    ctx.moveTo(size / 2, size / 2);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
}

function findIdealXForText(
  size: number,
  angle: number,
  radius: number,
  center_radius: number
) {
  const required_distance = (radius - center_radius) / 2 + center_radius;
  return size / 2 + required_distance * Math.cos(angle);
}

function findIdealYForText(
  size: number,
  angle: number,
  radius: number,
  center_radius: number
) {
  const required_distance = (radius - center_radius) / 2 + center_radius;
  return size / 2 + required_distance * Math.sin(angle);
}

function drawItems(
  ctx: CanvasRenderingContext2D,
  size: number,
  items: string[],
  font: string
) {
  ctx.fillStyle = "black";
  ctx.font = font;
  const step = (2 * Math.PI) / items.length;
  items.forEach((text, i) => {
    const angle = (i + 0.5) * step - Math.PI / 2;
    const x = findIdealXForText(
      size,
      angle,
      radius_box_proportion * size,
      middle_radius_box_proportion * size
    );
    const y = findIdealYForText(
      size,
      angle,
      radius_box_proportion * size,
      middle_radius_box_proportion * size
    );
    drawText(ctx, text, x, y);
  });
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number
) {
  const text_measure = ctx.measureText(text);
  const text_height =
    text_measure.fontBoundingBoxAscent + text_measure.fontBoundingBoxDescent;
  const subtexts = text.split(" ");
  const vertical_empty_space = 0;
  const vertical_text_space = subtexts.length * text_height;
  const total_vertical_space = vertical_empty_space + vertical_text_space;
  subtexts.forEach((subtext, i) => {
    const subtext_width = ctx.measureText(subtext).width;
    ctx.fillText(
      subtext,
      x - subtext_width / 2,
      y - total_vertical_space / 2 + (i + 0.75) * text_height
    );
  });
}

function drawSelected(
  ctx: CanvasRenderingContext2D,
  size: number,
  items: string[],
  selected_index: number
) {
  // hightlight section
  ctx.fillStyle = "red";
  ctx.lineWidth = 4;
  const step = (2 * Math.PI) / items.length;
  let angle = getSelectedIndex(items, selected_index) * step - Math.PI / 2;
  ctx.beginPath();
  ctx.moveTo(size / 2, size / 2);
  ctx.arc(
    size / 2,
    size / 2,
    size * selected_radius_box_proportion,
    angle,
    angle + step
  );
  ctx.fill();

  // redraw text
  ctx.fillStyle = "white";
  const text = items[getSelectedIndex(items, selected_index)];
  angle = (getSelectedIndex(items, selected_index) + 0.5) * step - Math.PI / 2;

  const x = findIdealXForText(
    size,
    angle,
    selected_radius_box_proportion * size,
    middle_radius_box_proportion * size
  );
  const y = findIdealYForText(
    size,
    angle,
    selected_radius_box_proportion * size,
    middle_radius_box_proportion * size
  );

  drawText(ctx, text, x, y);
}

function drawMiddleSection(
  ctx: CanvasRenderingContext2D,
  size: number,
  backgroundColor: string,
  isPressed: boolean
) {
  // draw circle
  ctx.fillStyle = backgroundColor;
  ctx.strokeStyle = "white";
  ctx.beginPath();
  ctx.arc(
    size / 2,
    size / 2,
    size * middle_radius_box_proportion,
    0,
    2 * Math.PI
  );
  ctx.fill();
  // draw button edge
  if (isPressed) {
    ctx.fillStyle = "red";
    ctx.strokeStyle = "blue";
  } else {
    ctx.fillStyle = "blue";
    ctx.strokeStyle = "red";
  }
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(
    size / 2,
    size / 2,
    size * button_radius_box_proportion,
    0,
    2 * Math.PI
  );
  ctx.fill();
  ctx.stroke();
  // write message
  let text;
  if (!isPressed) {
    text = "Hold.";
  } else {
    text = "Let go!";
  }
  if (text) {
    ctx.fillStyle = "black";
    drawText(ctx, text, size / 2, size / 2);
  }
}

function getSelectedIndex(selectedLevel: any, selectedIndex: number) {
  return Math.max(0, Math.floor(selectedIndex)) % getLevelSize(selectedLevel);
}

function getSelectedName(selectedLevel: any, selectedIndex: number) {
  return getLevelNames(selectedLevel)[
    getSelectedIndex(selectedLevel, selectedIndex)
  ];
}

function getLevelSize(selectedLevel: any) {
  return getLevelNames(selectedLevel).length;
}

function getLevelNames(selectedLevel: any) {
  if (!selectedLevel) return [];
  if (Array.isArray(selectedLevel)) return selectedLevel;
  return Object.keys(selectedLevel);
}

const BadRouletteSelector = React.forwardRef<HTMLInputElement, Props>(
  (
    {
      selectionOptions = [],
      size = 400,
      backgroundColor = "white",
      font = (size * 3) / 50 + "px sans-serif",
    },
    ref
  ) => {
    const canvasRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [selectedLevel, setSelectedLevel] = useState(selectionOptions);
    const [meterStart, setMeterStart] = useState(new Date().getTime());
    const [rotationSpeed, setRotationSpeed] = useState(0);
    const [isButtonPressed, setIsButtonPressed] = useState(false);

    const select = useCallback(
      (index: number) => {
        if (Array.isArray(selectedLevel)) {
          setIsOpen(false);
          setSelectedIndex(index);
        } else {
          setSelectedLevel(
            (selectedLevel: any) =>
              selectedLevel[getSelectedName(selectedLevel, index)]
          );
          setSelectedIndex(index);
        }
      },
      [selectedLevel]
    );

    useEffect(() => {
      let speed = rotationSpeed;
      let meterStart = new Date().getTime();
      let index = selectedIndex;
      const canvas = canvasRef.current as unknown as HTMLCanvasElement;
      const ctx = canvas?.getContext("2d");

      if (ctx) drawMiddleSection(ctx, size, backgroundColor, isButtonPressed);
      function draw(animate: any) {
        const meterStop = new Date().getTime();
        const elapsedTime = meterStop - meterStart;
        speed = speed - elapsedTime;
        index = index + (((speed / 1000) * elapsedTime) / 1000) * 10;
        if (canvas != null && isOpen) {
          if (!ctx) return;
          clear(ctx, size);
          drawBackground(ctx, size);
          drawSectors(ctx, size, getLevelSize(selectedLevel));
          drawItems(ctx, size, getLevelNames(selectedLevel), font);
          drawSelected(ctx, size, getLevelNames(selectedLevel), index);
          drawMiddleSection(ctx, size, backgroundColor, isButtonPressed);
        }
        meterStart = meterStop;
        if (animate) {
          if (speed > 0) {
            window.requestAnimationFrame(draw);
          } else {
            setTimeout(() => {
              select(index);
            }, 500)
          }
        }
      }
      if (speed > 0) {
        window.requestAnimationFrame(draw);
      } else {
        draw(false);
      }
      setRotationSpeed(0);
    }, [
      size,
      selectedLevel,
      backgroundColor,
      font,
      selectedIndex,
      canvasRef,
      isOpen,
      meterStart,
      rotationSpeed,
      isButtonPressed,
      select,
    ]);

    function startMeter() {
      setMeterStart(new Date().getTime());
      setIsButtonPressed(true);
    }

    function stopMeter() {
      const meterStop = new Date().getTime();
      const elapsedTime = meterStop - meterStart;
      setRotationSpeed(elapsedTime);
      setMeterStart(meterStop);
      setIsButtonPressed(false);
    }

    let selector;
    if (isOpen) {
      selector = (
        <canvas
          ref={canvasRef}
          height={size}
          width={size}
          style={{ backgroundColor: backgroundColor }}
          onMouseDown={startMeter}
          onMouseUp={stopMeter}
        />
      );
    } else {
      selector = (
        <select>
          <option>{getSelectedName(selectedLevel, selectedIndex)}</option>
        </select>
      );
    }
    return (
      <div
        style={{ margin: "1rem" }}
        onClick={() => {
          if (!isOpen) {
            setIsOpen(true);
            setSelectedLevel(selectionOptions);
            setSelectedIndex(0);
          }
        }}
      >
        <input
          type={"hidden"}
          ref={ref}
          value={getSelectedName(selectedLevel, selectedIndex)}
        ></input>
        {selector}
      </div>
    );
  }
);

export default BadRouletteSelector;
