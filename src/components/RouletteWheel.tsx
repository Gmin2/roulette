
"use client";
import React, { useEffect, useRef, useState } from "react";

const drawDot = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, sAngle: number, eAngle: number, counterclockwise: boolean, fillStyle: string, lineWidth: number, strokeStyle: string) => {
  if(ctx){
    ctx.beginPath();
    ctx.arc(x, y, r, sAngle, eAngle, counterclockwise);
    ctx.fillStyle = fillStyle;
    if(strokeStyle !== ""){
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = strokeStyle;
      ctx.stroke();
    }    
    ctx.fill();
    ctx.closePath();
  }
};

interface RouletteWheelProps {
  onSpinComplete: (winningNumber: string) => void;
  onSpinStart: () => void;
  isSpinning: boolean;
}

const RouletteWheel: React.FC<RouletteWheelProps> = ({ 
  onSpinComplete,
  onSpinStart,
  isSpinning 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  
  const [roulette, setRoulette] = useState({
    roulette_radius_x: 240,
    roulette_radius_y: 240,
    numbers: [
      "0", "32", "15", "19", "4", "21", "2", "25", "17", "34", "6", "27",
      "13", "36", "11", "30", "8", "23", "10", "5", "24", "16", "33", "1",
      "20", "14", "31", "9", "22", "18", "29", "7", "28", "12", "35", "3", "26"
    ],
    colors: [
      "green", "red", "black", "red", "black", "red", "black", "red", "black",
      "red", "black", "red", "black", "red", "black", "red", "black", "red",
      "black", "red", "black", "red", "black", "red", "black", "red", "black",
      "red", "black", "red", "black", "red", "black", "red", "black", "red"
    ],
    startAngle: -1.65,
    arc: Math.PI / (37 / 2),
    outsideRadius: 200,
    insideRadius: 170,
    textRadius: 180,
    font_bold_12: "bold 12px Arial",
    font_bold_14: "bold 14px Arial",
    radiantLine01: [5, 10],
    radiantLine02: [10, 15],
    radiantLine03: [15, 20],
    roulette_pos: [] as any[],
  });

  const [ball, setBall] = useState({
    x: 0,
    y: 0,
    speed: 0.05,
    width: 10,
    angle: 0,
    radius: 180
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      setCtx(context);
      createCanvas();
    }
  }, []);

  useEffect(() => {
    if (ctx) {
      drawRoulette();
    }
  }, [ctx, roulette, ball, isSpinning]);

  const createCanvas = () => {
    if (!canvasRef.current) return;
    
    if (window.innerWidth < 960) {
      canvasRef.current.width = 250;
      canvasRef.current.height = 250;
      setRoulette(prev => ({
        ...prev,
        roulette_radius_x: 125,
        roulette_radius_y: 125,
        outsideRadius: 100,
        insideRadius: 80,
        textRadius: 85,
      }));
      setBall(prev => ({
        ...prev,
        width: 6,
        radius: 85
      }));
    } else {
      canvasRef.current.width = 480;
      canvasRef.current.height = 480;
    }
  };

  const drawRouletteHoles = (outsideRadius: number, insideRadius: number, how_many: number, colors: any, text: boolean, startAngle: number) => {
    if (!ctx) return;
    
    const { roulette_radius_x, roulette_radius_y, numbers, textRadius } = roulette;
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
        ctx.fillStyle = (i === 0) ? "darkgreen" : (i % 2 === 0 ? "black" : "darkred");
      } else {
        ctx.fillStyle = colors[i];
      }

      ctx.fill();
      ctx.save();

      if (text) {
        ctx.fillStyle = "white";
        ctx.translate(
          roulette_radius_x + Math.cos(angle + arc / 2) * textRadius,
          roulette_radius_y + Math.sin(angle + arc / 2) * textRadius
        );
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        const text = numbers[i];
        ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
        roulette.roulette_pos.push({
          x: roulette_radius_x + Math.cos(angle + arc / 2) * (textRadius - 10),
          y: roulette_radius_y + Math.sin(angle + arc / 2) * (textRadius - 10),
          nr: text,
          color: colors[i]
        });
      }

      ctx.restore();
      ctx.closePath();
    }
  };

  const radiantLine = (how_many: number, line: number, color: string, offset: number[], startAngle: number) => {
    if (!ctx) return;

    const { roulette_radius_x, roulette_radius_y, textRadius } = roulette;
    const arc = Math.PI / (how_many / 2);

    for (let i = 0; i < how_many; i++) {
      let angle = startAngle + i * arc;

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = line;

      ctx.moveTo(
        roulette_radius_x + Math.cos(angle + arc) * (textRadius + offset[0]),
        roulette_radius_y + Math.sin(angle + arc) * (textRadius + offset[0])
      );
      ctx.lineTo(
        roulette_radius_x + Math.cos(angle + arc) * (textRadius + offset[1]),
        roulette_radius_y + Math.sin(angle + arc) * (textRadius + offset[1])
      );
      ctx.stroke();
      ctx.closePath();
    }
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
      numbers,
      colors
    } = roulette;

    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);

    // Draw the outer wheel
    ctx.shadowBlur = 10;
    drawDot(ctx, roulette_radius_x, roulette_radius_y, outsideRadius * 1.05, 0, 2 * Math.PI, false, '#a87b51', 15, '#5e391c');
    drawDot(ctx, roulette_radius_x, roulette_radius_y, outsideRadius * 0.97, 0, 2 * Math.PI, false, 'black', 15, 'black');
    ctx.shadowBlur = 0;

    // Draw the number segments
    ctx.font = font_bold_12;
    drawRouletteHoles(outsideRadius, insideRadius, numbers.length, colors, true, startAngle);
    ctx.font = font_bold_14;
    drawRouletteHoles(insideRadius - 1, insideRadius * 0.7, numbers.length, "dark", false, startAngle);

    // Draw the decorative lines
    radiantLine(numbers.length, 1, "gold", radiantLine01, startAngle);
    drawRouletteHoles(insideRadius * 0.7 - 1, 0, 12, "grey", false, startAngle);
    radiantLine(12, 1, "#4d4d4d", radiantLine02, startAngle);
    drawRouletteHoles(20, 0, 8, "gold", false, startAngle);
    radiantLine(8, 1, "#b99813", radiantLine03, startAngle);

    // Draw the ball if spinning
    if (isSpinning && ball.x && ball.y) {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.width, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.closePath();
    }
  };

  const calculateFinalBallPosition = (winningNumber: string) => {
    const numberIndex = roulette.numbers.indexOf(winningNumber);
    const angle = roulette.startAngle + (numberIndex * roulette.arc) + (roulette.arc / 2);
    
    return {
      x: roulette.roulette_radius_x + Math.cos(angle) * roulette.textRadius,
      y: roulette.roulette_radius_y + Math.sin(angle) * roulette.textRadius,
      angle: angle
    };
  };

  const spin = () => {
    if (isSpinning) return;
    onSpinStart();

    let spinCount = 0;
    const totalSpins = 300;
    const initialSpeed = 0.2;
    const initialBallSpeed = 0.3;

    // Initialize ball position
    setBall(prev => ({
      ...prev,
      angle: 0,
      x: roulette.roulette_radius_x,
      y: roulette.roulette_radius_y - prev.radius,
    }));

    const animateSpin = () => {
      if (spinCount >= totalSpins) {
        const finalAngle = roulette.startAngle % (2 * Math.PI);
        const numberIndex = Math.floor(
          (finalAngle - roulette.startAngle) / roulette.arc
        ) % roulette.numbers.length;
        
        const winningNumber = roulette.numbers[numberIndex];
        const finalPosition = calculateFinalBallPosition(winningNumber);
        
        setBall(prev => ({
          ...prev,
          x: finalPosition.x,
          y: finalPosition.y,
          angle: finalPosition.angle
        }));
        
        onSpinComplete(winningNumber);
      } else {
        spinCount++;
        const decelerationFactor = 1 - (spinCount / totalSpins);
        const currentSpeed = initialSpeed * decelerationFactor;
        
        // Ball animation
        let ballSpeed = initialBallSpeed;
        let currentRadius = ball.radius;

        if (spinCount > totalSpins / 2) {
          const remainingSpins = totalSpins - spinCount;
          const radiusDecreaseFactor = remainingSpins / (totalSpins / 2);
          currentRadius = ball.radius * (0.85 + 0.15 * radiusDecreaseFactor);
          ballSpeed = initialBallSpeed * decelerationFactor * 1.5;
        }

        setBall(prev => ({
          ...prev,
          angle: prev.angle + ballSpeed,
          radius: currentRadius,
          x: roulette.roulette_radius_x + Math.cos(prev.angle) * currentRadius,
          y: roulette.roulette_radius_y + Math.sin(prev.angle) * currentRadius
        }));

        setRoulette(prev => ({
          ...prev,
          startAngle: prev.startAngle + currentSpeed,
        }));

        requestAnimationFrame(animateSpin);
      }
    };

    requestAnimationFrame(animateSpin);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="border rounded-lg shadow-lg" />
      <button 
        onClick={spin}
        disabled={isSpinning}
        className="px-6 py-2 bg-green-600 text-white rounded-lg 
                   hover:bg-green-700 disabled:opacity-50 
                   disabled:cursor-not-allowed"
      >
        {isSpinning ? 'Spinning...' : 'Spin'}
      </button>
    </div>
  );
};

export default RouletteWheel;