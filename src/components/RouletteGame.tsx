"use client";
import React, { useEffect, useRef, useState } from "react";

const drawDot = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, sAngle: number, eAngle: number, counterclockwise: boolean, fillStyle: string, lineWidth: number, strokeStyle: string) => {
	if(ctx){
		ctx.beginPath()
		ctx.arc(x, y, r, sAngle, eAngle, counterclockwise)
		ctx.fillStyle = fillStyle
		if(strokeStyle !== ""){
			ctx.lineWidth = lineWidth
			ctx.strokeStyle = strokeStyle
			ctx.stroke()
		}		
		ctx.fill()
		ctx.closePath()
	}
}

// make the roulette wheel bigger
const RouletteGame = (props: any) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [startGame, setStartGame] = useState(false);
  const [roulette, setRoulette] = useState({
    roulette_radius_x: 240,
    roulette_radius_y: 240,
    numbers: [] as string[],
    colors: [] as string[],
    startAngle: -1.65,
    arc: 0,
    outsideRadius: 200,
    insideRadius: 170,
    textRadius: 180,
    font_bold_12: "bold 12px Arial",
    font_bold_14: "bold 14px Arial",
    roulette_type: props.page.game.table_type,
    radiantLine01: [5, 10], 
    radiantLine02: [10, 15], 
    radiantLine03: [15, 20], 
    roulette_pos: [] as any[],
  });

  // Set up canvas and choose roulette type on component mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      setCtx(context);
    }
    createCanvas();
    chooseRouletteType();
  }, []);

  useEffect(() => {
    if (ctx) {
      drawRoulette();
    }
  }, [ctx, roulette]);

  const createCanvas = () => {
    if (window.innerWidth < 960) {
      canvasRef.current!.width = 250;
      canvasRef.current!.height = 250;
      setRoulette((prev) => ({
        ...prev,
        roulette_radius_x: 125,
        roulette_radius_y: 125,
        outsideRadius: 100,
        insideRadius: 80,
        textRadius: 85,
      }));
    } else {
      canvasRef.current!.width = 480;
      canvasRef.current!.height = 480;
    }
  };

  const chooseRouletteType = () => {
    const { roulette_type } = roulette;
    let newColors: string[] = [];
    let newNumbers: string[] = [];

    if (roulette_type === "european") {
      newColors = [
        "green", "red", "black", "red", "black", "red", "black", "red", "black",
        "red", "black", "red", "black", "red", "black", "red", "black", "red",
        "black", "red", "black", "red", "black", "red", "black", "red", "black",
        "red", "black", "red", "black", "red", "black", "red", "black", "red"
      ];
      newNumbers = [
        "0", "32", "15", "19", "4", "21", "2", "25", "17", "34", "6", "27",
        "13", "36", "11", "30", "8", "23", "10", "5", "24", "16", "33", "1",
        "20", "14", "31", "9", "22", "18", "29", "7", "28", "12", "35", "3", "26"
      ];
    } else {
      newColors = [
        "green", "black", "red", "black", "red", "black", "red", "black", "red",
        "black", "red", "black", "red", "black", "red", "black", "red", "black",
        "red", "green", "red", "black", "red", "black", "red", "black", "red",
        "black", "red", "black", "red", "black", "red", "black", "red", "black",
        "red"
      ];
      newNumbers = [
        "0", "28", "9", "26", "30", "11", "7", "20", "32", "17", "5", "22",
        "34", "15", "3", "24", "36", "13", "1", "00", "27", "10", "25", "29",
        "12", "8", "19", "31", "18", "6", "21", "33", "16", "4", "23", "35", "14", "2"
      ];
    }

    setRoulette((prev) => ({
      ...prev,
      colors: newColors,
      numbers: newNumbers,
      arc: Math.PI / (newNumbers.length / 2),
    }));
  };

  const drawRoulette = () => {
    if (!ctx) return;

    const {
      roulette_radius_x,
      roulette_radius_y,
      outsideRadius,
      insideRadius,
      startAngle,
      font_bold_12,
      font_bold_14,
      radiantLine01,
      radiantLine02,
      radiantLine03,
    } = roulette;

    ctx.shadowBlur = 10;
    drawDot(ctx, roulette_radius_x, roulette_radius_y, outsideRadius * 1.05, 0, 2 * Math.PI, false, '#a87b51', 15, '#5e391c');
    drawDot(ctx, roulette_radius_x, roulette_radius_y, outsideRadius * 0.97, 0, 2 * Math.PI, false, 'black', 15, 'black');
    ctx.shadowBlur = 0;

    ctx.font = font_bold_12;
    drawRouletteHoles(outsideRadius, insideRadius, roulette.numbers.length, roulette.colors, true, startAngle);
    ctx.font = font_bold_14;
    drawRouletteHoles(insideRadius - 1, insideRadius * 0.7, roulette.numbers.length, "dark", false, startAngle);

    radiantLine(roulette.numbers.length, 1, "gold", radiantLine01, startAngle);
    drawRouletteHoles(insideRadius * 0.7 - 1, 0, 12, "grey", false, startAngle);
    radiantLine(12, 1, "#4d4d4d", radiantLine02, startAngle);
    drawRouletteHoles(20, 0, 8, "gold", false, startAngle);
    radiantLine(8, 1, "#b99813", radiantLine03, startAngle);
  };

  const drawRouletteHoles = (outsideRadius: number, insideRadius: number, how_many: number, colors: any, text: boolean, startAngle: number) => {
    if (!ctx) return;
    
    const { roulette_radius_x, roulette_radius_y, numbers } = roulette;
    const arc = Math.PI / (how_many / 2);

    for (let i = 0; i < how_many; i++) {
      let angle = startAngle + i * arc;

      ctx.beginPath();
      ctx.arc(roulette_radius_x, roulette_radius_y, outsideRadius, angle, angle + arc, false);
      ctx.arc(roulette_radius_x, roulette_radius_y, insideRadius, angle + arc, angle, true);

      if (colors === "grey") {
        ctx.fillStyle = (i % 2 === 0) ? "gray" : "#999";
      } else if (colors === "gold") {
        ctx.fillStyle = (i % 2 === 0) ? "#f0d875" : "#eac739";
      } else if (colors === "dark") {
        if (roulette.roulette_type === "european") {
          ctx.fillStyle = (i === 0) ? "darkgreen" : (i % 2 === 0 ? "black" : "darkred");
        } else if (roulette.roulette_type === "american") {
          ctx.fillStyle = (i === 0 || i === 19) ? "darkgreen" : (i % 2 === 0 ? "darkred" : "black");
        }
      } else {
        ctx.fillStyle = colors[i];
      }

      ctx.fill();
      ctx.save();

      if (text) {
        ctx.fillStyle = "white";
        ctx.translate(roulette_radius_x + Math.cos(angle + arc / 2) * roulette.textRadius, roulette_radius_y + Math.sin(angle + arc / 2) * roulette.textRadius);
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        const text = numbers[i];
        ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
        roulette.roulette_pos.push({ x: roulette_radius_x + Math.cos(angle + arc / 2) * (roulette.textRadius - 10), y: roulette_radius_y + Math.sin(angle + arc / 2) * (roulette.textRadius - 10), nr: text, color: colors[i] });
      }

      ctx.restore();
      ctx.closePath();
    }
  };

  const radiantLine = (how_many: number, line: number, color: string, offset: number[], startAngle: number) => {
    if (!ctx) return;

    const { roulette_radius_x, roulette_radius_y } = roulette;
    const arc = Math.PI / (how_many / 2);

    for (let i = 0; i < how_many; i++) {
      let angle = startAngle + i * arc;

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = line;

      ctx.moveTo(roulette_radius_x + Math.cos(angle + arc) * (roulette.textRadius + offset[0]), roulette_radius_y + Math.sin(angle + arc) * (roulette.textRadius + offset[0]));
      ctx.lineTo(roulette_radius_x + Math.cos(angle + arc) * (roulette.textRadius + offset[1]), roulette_radius_y + Math.sin(angle + arc) * (roulette.textRadius + offset[1]));
      ctx.stroke();
      ctx.closePath();
    }
  };

  const startRoulette = () => {
    setStartGame(true);
    let spin_nr = 0;
    const totalSpins = 300; // Increased for a longer, smoother animation
    const initialSpeed = 0.2; // Starting speed
  
    const spin = () => {
      if (spin_nr >= totalSpins) {
        setStartGame(false);
      } else {
        spin_nr++;
        
        // Calculate deceleration factor
        const decelerationFactor = 1 - (spin_nr / totalSpins);
        
        // Calculate current speed
        const currentSpeed = initialSpeed * decelerationFactor;
  
        setRoulette((prev) => ({
          ...prev,
          startAngle: prev.startAngle + currentSpeed,
        }));
  
        window.requestAnimationFrame(spin);
      }
    };
  
    window.requestAnimationFrame(spin);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <canvas ref={canvasRef} />
      <button onClick={startRoulette}>Start Game</button>
    </div>
  );
};

export default RouletteGame;