// AdminEditor.tsx
import React, { useState, useEffect, useRef } from 'react';

interface Position {
  memberNumber: number;
  x: number;
  y: number;
}

// 親からデータと保存関数を受け取る設定
interface AdminEditorProps {
  totalCount: number;
  setTotalCount: (count: number) => void;
  positions: Position[];
  setPositions: (positions: Position[]) => void;
}

export const AdminEditor: React.FC<AdminEditorProps> = ({
  totalCount,
  setTotalCount,
  positions,
  setPositions,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedNumber, setDraggedNumber] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const applyTemplate = (type: 'line' | 'circle' | 'vShape') => {
    const newPositions: Position[] = [];
    for (let i = 0; i < totalCount; i++) {
      const num = i + 1;
      let x = 500;
      let y = 500;

      if (type === 'line') {
        x = 150 + (i / (totalCount - 1)) * 700;
        y = 550;
      } else if (type === 'circle') {
        const angle = (i / totalCount) * 2 * Math.PI;
        x = 500 + Math.cos(angle) * 300;
        y = 550 + Math.sin(angle) * 300;
      } else if (type === 'vShape') {
        const isLeft = i < totalCount / 2;
        const step = isLeft ? i : i - Math.floor(totalCount / 2);
        x = isLeft ? 500 - step * 12 : 500 + step * 12;
        y = 300 + step * 15;
      }
      newPositions.push({ memberNumber: num, x, y });
    }
    setPositions(newPositions); // 親のデータを更新
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const size = canvas.width;

    const clickVirtualX = (mouseX / size) * 1000;
    const clickVirtualY = (mouseY / size) * 1000;

    const hit = positions.find((pos) => {
      const distance = Math.sqrt(Math.pow(pos.x - clickVirtualX, 2) + Math.pow(pos.y - clickVirtualY, 2));
      return distance < 25;
    });

    if (hit) {
      setIsDragging(true);
      setDraggedNumber(hit.memberNumber);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || draggedNumber === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const size = canvas.width;
    let newX = ((e.clientX - rect.left) / size) * 1000;
    let newY = ((e.clientY - rect.top) / size) * 1000;

    newX = Math.max(20, Math.min(980, newX));
    newY = Math.max(20, Math.min(980, newY));

    setPositions(
      positions.map((pos) =>
        pos.memberNumber === draggedNumber ? { ...pos, x: newX, y: newY } : pos
      )
    );
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDraggedNumber(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = Math.min(canvas.clientWidth, canvas.clientHeight);
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    // ステージ
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, size, size * 0.12);
    ctx.fillStyle = '#475569';
    ctx.font = `bold ${size * 0.04}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ステージ（前）', size / 2, size * 0.08);

    // センターライン
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, size * 0.55); ctx.lineTo(size, size * 0.55); ctx.stroke();
    ctx.setLineDash([]);

    // メンバー描画
    positions.forEach((pos) => {
      const drawX = (pos.x / 1000) * size;
      const drawY = (pos.y / 1000) * size;
      const isSelected = pos.memberNumber === draggedNumber;

      ctx.beginPath();
      ctx.arc(drawX, drawY, size * 0.016, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#ef4444' : '#3b82f6';
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = `${size * 0.015}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(pos.memberNumber), drawX, drawY);
    });
  }, [positions, draggedNumber]);

  return (
    <div style={{ display: 'flex', flex1: 1, backgroundColor: '#f1f5f9', height: '100%' }}>
      <aside style={{ width: '200px', backgroundColor: '#ffffff', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', borderRight: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#475569' }}>⚙️ 一発自動配置</h3>
        <button onClick={() => applyTemplate('line')} style={buttonStyle}>↔️ 横一列に並べる</button>
        <button onClick={() => applyTemplate('circle')} style={buttonStyle}>⭕ 円形に並べる</button>
        <button onClick={() => applyTemplate('vShape')} style={buttonStyle}>🔼 V字に並べる</button>
      </aside>

      <main style={{ flex: 1, backgroundColor: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
        <canvas 
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          style={{ width: '100%', height: '100%', maxWidth: '500px', maxHeight: '500px', backgroundColor: '#ffffff', borderRadius: '8px', cursor: isDragging ? 'grabbing' : 'grab' }}
        />
      </main>
    </div>
  );
};

const buttonStyle = {
  padding: '12px',
  fontSize: '13px',
  fontWeight: 'bold',
  backgroundColor: '#f1f5f9',
  color: '#334155',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  cursor: 'pointer',
  textAlign: 'left' as const,
};
