import React from "react";
import { useEffect, useRef, MouseEvent, useState } from "react";

import "./RouletteSelector.css";

type Props = {
  selectionOptions?: string[];
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
  if (selected_index < 0 || selected_index >= items.length) return;
  // hightlight section
  ctx.fillStyle = "red";
  ctx.lineWidth = 4;
  const step = (2 * Math.PI) / items.length;
  let angle = selected_index * step - Math.PI / 2;
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
  const text = items[selected_index];
  angle = (selected_index + 0.5) * step - Math.PI / 2;

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
  text: string
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
  // write text
  if (text) {
    ctx.fillStyle = "black";
    drawText(ctx, text, size / 2, size / 2);
  }
}

const RouletteSelector = React.forwardRef<HTMLInputElement, Props>(
  (
    {
      selectionOptions = [],
      size = 200,
      backgroundColor = "white",
      font = (size * 3) / 50 + "px sans-serif",
      label = "",
    },
    ref
  ) => {
    const canvasRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    useEffect(() => {
      const canvas = canvasRef.current as unknown as HTMLCanvasElement;
      if (canvas != null && isOpen) {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        clear(ctx, size);
        drawBackground(ctx, size);
        drawSectors(ctx, size, selectionOptions.length);
        drawItems(ctx, size, selectionOptions, font);
        drawSelected(ctx, size, selectionOptions, selectedIndex);
        drawMiddleSection(
          ctx,
          size,
          backgroundColor,
          selectionOptions[selectedIndex]
        );
      }
    }, [
      size,
      selectionOptions,
      backgroundColor,
      font,
      selectedIndex,
      canvasRef,
      isOpen,
    ]);

    function updateSelectedItem(e: MouseEvent<HTMLCanvasElement>) {
      const canvas = canvasRef.current as unknown as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      const x = Math.round(e.clientX - rect.left) - size / 2;
      const y = Math.round(e.clientY - rect.top) - size / 2;
      // atan returns a value in [-PI; PI], add 2PI to get strictly positive values and PI/2 so that the angle starts measuring on the vertical axis
      const angle = (Math.atan2(y, x) + 2.5 * Math.PI) % (2 * Math.PI);
      const step = (2 * Math.PI) / selectionOptions.length;
      const selectedIndex = Math.max(
        0,
        Math.min(Math.floor(angle / step), selectionOptions.length - 1)
      );
      setSelectedIndex(selectedIndex);
    }

    let selector;
    if (isOpen) {
      selector = (
        <canvas
          ref={canvasRef}
          height={size}
          width={size}
          style={{ backgroundColor: backgroundColor }}
          onMouseMove={updateSelectedItem}
        />
      );
    } else {
      selector = (
        <div className={"roulette-selector-closed"}>
          {selectionOptions[selectedIndex] || selectionOptions[0]}
        </div>
      );
    }
    return (
      <div
        style={{ margin: "1rem" }}
        onClick={() => {
          setIsOpen((isOpen) => !isOpen);
        }}
      >
        <input
          type={"hidden"}
          ref={ref}
          value={selectionOptions[selectedIndex] || selectionOptions[0]}
        ></input>
        {selector}
      </div>
    );
  }
);

export default RouletteSelector;
