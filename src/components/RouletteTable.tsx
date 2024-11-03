
"use client";
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { getMousePos, isInside } from '../utils/games';

interface Bet {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  text: string;
  bet_value: number;
}

interface RouletteTableProps {
  onBetPlace: (bets: Bet[]) => void;
  balance: number;
  disabled: boolean;
  currentBets: Bet[];
}

export interface RouletteTableRef {
  resetBets: () => void;
}

const RouletteTable = forwardRef<RouletteTableRef, RouletteTableProps>(({
  onBetPlace,
  balance,
  disabled,
  currentBets
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [smallImage, setSmallImage] = useState(false);
  const [rouletteBetsCoord, setRouletteBetsCoord] = useState([0, 0, 795, 268, 0, 0, 795, 268]);
  const [listBets, setListBets] = useState<Bet[]>([]);
  const [yourBets, setYourBets] = useState<Bet[]>([]);
  const [betSquare, setBetSquare] = useState(40);
  const [betValueSum, setBetValueSum] = useState(0);
  const [baseValue, setBaseValue] = useState(10); // Base betting value

  const numbers = [
    "0", "32", "15", "19", "4", "21", "2", "25", "17", "34", "6", "27",
    "13", "36", "11", "30", "8", "23", "10", "5", "24", "16", "33", "1",
    "20", "14", "31", "9", "22", "18", "29", "7", "28", "12", "35", "3", "26"
  ];

  // Expose resetBets method
  useImperativeHandle(ref, () => ({
    resetBets: () => {
      setYourBets([]);
      setBetValueSum(0);
      drawTable();
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      setCtx(context);
      createCanvas();
    }

    window.addEventListener('resize', createCanvas);
    return () => window.removeEventListener('resize', createCanvas);
  }, []);

  useEffect(() => {
    if (ctx) {
      drawTable();
      currentBets.forEach(bet => drawBetToken(bet));
    }
  }, [ctx, listBets, currentBets]);

  const createCanvas = () => {
    if (!canvasRef.current) return;

    if (window.innerWidth < 960) {
      if (window.innerHeight < window.innerWidth) {
        // small landscape
        canvasRef.current.width = 400;
        canvasRef.current.height = 135;
        setRouletteBetsCoord([0, 0, 795, 268, 0, 0, 400, 135]);
        setSmallImage(false);
        setBetSquare(30);
      } else {
        // small portrait
        canvasRef.current.width = 135;
        canvasRef.current.height = 400;
        setSmallImage(true);
        setRouletteBetsCoord([0, 0, 382, 1136, 0, 0, 191, 568]);
        setBetSquare(30);
      }
    } else {
      // big
      canvasRef.current.width = 795;
      canvasRef.current.height = 270;
      setRouletteBetsCoord([0, 0, 795, 268, 0, 0, 795, 268]);
      setBetSquare(40);
    }
    setupBettingGrid();
  };

  const getSquaresByScreenSize = () => {
    if (window.innerWidth < 960) {
      if (window.innerHeight < window.innerWidth) {
        return {
          a: {x: 0, y: 0, w: 27, h: 78}, // 0
          c: {x: 26, y: 80, w: 27, h: 27}, // first square
          d: {x: 27, y: 80, w: 106, h: 27}, // first 12
          e: {x: 27, y: 110, w: 53, h: 27}, // 1-18
          f: {x: 345, y: 0, w: 53, h: 27}, // 2 to 1
        };
      } else {
        return {
          a: {x: 53, y: 0, w: 78, h: 27},
          c: {x: 27, y: 27, w: 27, h: 26},
          d: {x: 27, y: 27, w: 27, h: 106},
          e: {x: 0, y: 27, w: 27, h: 53},
          f: {x: 53, y: 345, w: 27, h: 53},
        };
      }
    } else {
      return {
        a: {x: 0, y: 0, w: 53, h: 160},
        c: {x: 50, y: 160, w: 53, h: 57},
        d: {x: 50, y: 160, w: 212, h: 57},
        e: {x: 50, y: 212, w: 106, h: 57},
        f: {x: 685, y: 0, w: 106, h: 53},
      };
    }
  };

  const setupBettingGrid = () => {
    const squares = getSquaresByScreenSize();
    const newListBets: Bet[] = [];
    let a = 0;

    // Add zero
    newListBets.push({
      x: squares.a.x,
      y: squares.a.y,
      width: squares.a.w,
      height: squares.a.h,
      color: "green",
      text: "0",
      bet_value: baseValue
    });

    // Add numbers
    if (!smallImage) {
      for (let i = 1; i < numbers.length; i++) {
        a++;
        if (a > 3) {
          squares.c.x = squares.c.x + squares.c.w;
          squares.c.y = squares.c.y + 2 * squares.c.w;
          a = 1;
        } else {
          squares.c.y = squares.c.y - squares.c.w;
        }

        newListBets.push({
          x: squares.c.x,
          y: squares.c.y,
          width: squares.c.w,
          height: squares.c.h,
          color: i % 2 === 0 ? "red" : "black",
          text: numbers[i],
          bet_value: baseValue
        });
      }
    } else {
      for (let i = 1; i < numbers.length; i++) {
        a++;
        if (a > 3) {
          squares.c.x = squares.c.x - 2 * squares.c.w;
          squares.c.y = squares.c.y + squares.c.h;
          a = 1;
        } else {
          squares.c.x = squares.c.x + squares.c.w;
        }

        newListBets.push({
          x: squares.c.x,
          y: squares.c.y,
          width: squares.c.w,
          height: squares.c.h,
          color: i % 2 === 0 ? "red" : "black",
          text: numbers[i],
          bet_value: baseValue
        });
      }
    }

    setListBets(newListBets);
  };

  const drawTable = () => {
    if (!ctx || !canvasRef.current) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw background
    ctx.fillStyle = '#0f672e';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw grid lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;

    // Draw betting squares
    listBets.forEach(bet => {
      ctx.beginPath();
      ctx.fillStyle = bet.color;
      ctx.fillRect(bet.x, bet.y, bet.width, bet.height);
      ctx.strokeRect(bet.x, bet.y, bet.width, bet.height);

      // Draw number text
      ctx.fillStyle = 'white';
      ctx.font = `${smallImage ? '10px' : '12px'} Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        bet.text,
        bet.x + bet.width / 2,
        bet.y + bet.height / 2
      );
    });
  };

  const drawBetToken = (bet: Bet) => {
    if (!ctx) return;

    const x = bet.x + bet.width / 2;
    const y = bet.y + bet.height / 2;
    const radius = Math.min(bet.width, bet.height) / 3;

    // Draw betting chip
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw bet value
    ctx.fillStyle = 'black';
    ctx.font = `bold ${smallImage ? '8px' : '10px'} Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(bet.bet_value.toString(), x, y);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return;

    const mousePos = getMousePos(canvasRef.current!, event);
    
    for (const bet of listBets) {
      if (isInside(mousePos, bet)) {
        if (betValueSum + bet.bet_value > balance) {
          alert("Insufficient balance!");
          return;
        }

        const newBet = { ...bet };
        setBetValueSum(prev => prev + newBet.bet_value);
        const newBets = [...yourBets, newBet];
        setYourBets(newBets);
        onBetPlace(newBets);
        break;
      }
    }
  };

  const handleBaseValueChange = (value: number) => {
    setBaseValue(value);
    setListBets(prev => 
      prev.map(bet => ({
        ...bet,
        bet_value: value
      }))
    );
  };

  return (
    <div className="relative">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bet Amount:
        </label>
        <div className="flex gap-2">
          {[10, 20, 50, 100].map(value => (
            <button
              key={value}
              onClick={() => handleBaseValueChange(value)}
              className={`px-3 py-1 rounded ${
                baseValue === value 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              ${value}
            </button>
          ))}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="border border-gray-300 rounded-lg shadow-lg"
      />
      
      <div className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded">
        Total Bet: ${betValueSum}
      </div>
    </div>
  );
});

export default RouletteTable;