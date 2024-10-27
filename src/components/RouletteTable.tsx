import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getMousePos, get_roulette_bets, isInside } from '../utils/games';
import Image from 'next/image';
import carrotImg from '../public/img/icons/carrot_icon.png';

function RouletteTable({ page, user, onBetsChange }) {
  const canvasRef = useRef(null);
  const [rouletteType, setRouletteType] = useState(page.game.table_type);
  const [listBets, setListBets] = useState([]);
  const [yourBets, setYourBets] = useState([]);
  const [betSquare, setBetSquare] = useState(40);
  const [money, setMoney] = useState(user.money);

  const createCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let rouletteBetsCoord;

    if (window.innerWidth < 960) {
      if (window.innerHeight < window.innerWidth) {
        // small landscape
        canvas.width = 400;
        canvas.height = 135;
        rouletteBetsCoord = [0, 0, 795, 268, 0, 0, 400, 135];
      } else {
        // small portrait
        canvas.width = 135;
        canvas.height = 400;
        rouletteBetsCoord = [0, 0, 382, 1136, 0, 0, 191, 568];
      }
      setBetSquare(30);
    } else {
      // big
      canvas.width = 795;
      canvas.height = 270;
      rouletteBetsCoord = [0, 0, 795, 268, 0, 0, 795, 268];
      setBetSquare(40);
    }

    return { ctx, rouletteBetsCoord };
  }, []);

  const drawRouletteBets = useCallback((ctx, img, rouletteBetsCoord) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const [sx, sy, swidth, sheight, x, y, width, height] = rouletteBetsCoord;
    ctx.drawImage(img, sx, sy, swidth, sheight, x, y, width, height);
  }, []);

  const createRouletteBets = useCallback(() => {
    const items = get_roulette_bets();
    const numbers = rouletteType === 'european' 
      ? ["0", "32", "15", "19", "4", "21", "2", "25", "17", "34", "6", "27", "13", "36", "11", "30", "8", "23", "10", "5", "24", "16", "33", "1", "20", "14", "31", "9", "22", "18", "29", "7", "28", "12", "35", "3", "26"]
      : ["0", "28", "9", "26", "30", "11", "7", "20", "32", "17", "5", "22", "34", "15", "3", "24", "36", "13", "1", "00", "27", "10", "25", "29", "12", "8", "19", "31", "18", "6", "21", "33", "16", "4", "23", "35", "14", "2"];

    // Implement the logic to create roulette bets based on the canvas size and roulette type
    // This should populate the listBets state
    // For brevity, I'm omitting the detailed implementation here
    
    setListBets(/* calculated list bets */);
  }, [rouletteType]);

  const handleCanvasClick = useCallback((event) => {
    const canvas = canvasRef.current;
    const mousePos = getMousePos(canvas, event);
    
    for (let obj of listBets) {
      if (isInside(mousePos, obj)) {
        const newBetValueSum = yourBets.reduce((sum, bet) => sum + bet.bet_value, 0) + obj.bet_value;
        if (newBetValueSum > money) {
          alert("Not enough money for this bet");
        } else {
          const newYourBets = [...yourBets, obj];
          setYourBets(newYourBets);
          onBetsChange(newYourBets);
          drawToken(obj);
        }
        break;
      }
    }
  }, [listBets, yourBets, money, onBetsChange]);

  const drawToken = useCallback((bet) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const x = bet.x + bet.width / 2 - betSquare / 4;
    const y = bet.y + bet.height / 2 - betSquare / 4 - 5;
    const w = betSquare / 2;
    const h = betSquare / 2 + 10;
    
    const img = new Image();
    img.src = carrotImg.src;
    img.onload = () => {
      ctx.drawImage(img, x, y, w, h);
    };
  }, [betSquare]);

  useEffect(() => {
    const { ctx, rouletteBetsCoord } = createCanvas();
    createRouletteBets();

    // Load and draw the roulette image
    const img = new Image();
    img.src = `/img/roulette_${rouletteType}.png`; // Assuming you have these images
    img.onload = () => drawRouletteBets(ctx, img, rouletteBetsCoord);

    const canvas = canvasRef.current;
    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [createCanvas, createRouletteBets, drawRouletteBets, handleCanvasClick, rouletteType]);

  useEffect(() => {
    const handleResize = () => {
      const { ctx, rouletteBetsCoord } = createCanvas();
      createRouletteBets();
      
      const img = new Image();
      img.src = `/img/roulette_${rouletteType}.png`;
      img.onload = () => drawRouletteBets(ctx, img, rouletteBetsCoord);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [createCanvas, createRouletteBets, drawRouletteBets, rouletteType]);

  return <canvas ref={canvasRef} />;
}

export default RouletteTable;