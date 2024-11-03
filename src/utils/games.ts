export const getMousePos = (canvas: HTMLCanvasElement, event: React.MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
};

export const isInside = (pos: { x: number; y: number }, rect: { x: number; y: number; width: number; height: number }) => {
  return pos.x > rect.x && 
         pos.x < rect.x + rect.width && 
         pos.y > rect.y && 
         pos.y < rect.y + rect.height;
};