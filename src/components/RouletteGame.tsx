
"use client";
import React, { useState, useRef } from 'react';
import RouletteWheel from './RouletteWheel';
import RouletteTable, { RouletteTableRef } from './RouletteTable';

interface Bet {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  text: string;
  bet_value: number;
}

const RouletteGame = () => {
  const [balance, setBalance] = useState(1000);
  const [currentBets, setCurrentBets] = useState<Bet[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWinningNumber, setLastWinningNumber] = useState<string | null>(null);
  const [totalBetAmount, setTotalBetAmount] = useState(0);

  const tableRef = useRef<RouletteTableRef>(null);

  const handleBetPlace = (bets: Bet[]) => {
    let totalBets = 0;
    bets.forEach(bet => {
      totalBets += bet.bet_value;
    });

    if (totalBets <= balance) {
      setCurrentBets(bets);
      setTotalBetAmount(totalBets);
    } else {
      alert("Insufficient balance!");
    }
  };

  const handleSpinComplete = (winningNumber: string) => {
    setLastWinningNumber(winningNumber);
    setIsSpinning(false);

    // Calculate winnings
    const winningBets = currentBets.filter(bet => bet.text === winningNumber);
    const totalWinnings = winningBets.reduce((sum, bet) => sum + bet.bet_value * 35, 0);
    
    if (totalWinnings > 0) {
      setBalance(prev => prev + totalWinnings);
      alert(`Congratulations! You won $${totalWinnings}`);
    } else {
      setBalance(prev => prev - totalBetAmount);
      alert('Better luck next time!');
    }
    
    setCurrentBets([]);
    setTotalBetAmount(0);

    if (tableRef.current) {
      tableRef.current.resetBets();
    }
  };

  const handleStartSpin = () => {
    if (currentBets.length === 0) {
      alert('Please place at least one bet!');
      return;
    }
    setIsSpinning(true);
  };

  const handleClearBets = () => {
    if (!isSpinning) {
      setBalance(prev => prev + totalBetAmount);
      setCurrentBets([]);
      setTotalBetAmount(0);
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Roulette</h1>
        <div className="text-2xl font-semibold text-green-600">Balance: ${balance}</div>
        {lastWinningNumber && (
          <div className="mt-2 text-lg text-gray-600">
            Last winning number: {lastWinningNumber}
          </div>
        )}
        <div className="text-lg text-gray-600">
          Total Bet: ${totalBetAmount}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <RouletteWheel 
            onSpinComplete={handleSpinComplete}
            onSpinStart={handleStartSpin}
            isSpinning={isSpinning}
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Betting Table</h2>
            <button
              onClick={handleClearBets}
              disabled={isSpinning || currentBets.length === 0}
              className="px-4 py-2 bg-red-600 text-white rounded-lg 
                         disabled:opacity-50 hover:bg-red-700"
            >
              Clear Bets
            </button>
          </div>
          
          <RouletteTable
            onBetPlace={handleBetPlace}
            balance={balance}
            disabled={isSpinning}
            currentBets={currentBets}
          />
        </div>
      </div>
    </div>
  );
};

export default RouletteGame;