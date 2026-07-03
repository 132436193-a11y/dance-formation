// Viewer.tsx
import React, { useState, useEffect, useRef } from 'react';

interface Position {
  memberNumber: number;
  x: number;
  y: number;
}

interface Formation {
  id: string;
  name: string;
  positions: Position[];
}

// 親(App.tsx)からデータと操作関数を受け取るための設定
interface PerformerViewerProps {
  formations: Formation[];
  currentFrameIndex: number;
  setCurrentFrameIndex: (index: number) => void;
}

export const PerformerViewer: React.FC<PerformerViewerProps> = ({
  formations,
  currentFrameIndex,
  setCurrentFrameIndex,
}) => {
  const [myNumber, setMyNumber] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = Math.min(canvas.clientWidth, canvas.clientHeight);
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    // 背景：ステージ
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, size, size * 0.12);
    ctx.fillStyle = '#475569';
    ctx.font = `bold ${size * 0.04}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ステージ（前）', size / 2, size * 0.08);

    // 背景：センターライン
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, size * 0.55); ctx.lineTo(size, size * 0.55); ctx.stroke();
    ctx.setLineDash([]);

    // 選択されたコマのデータを描画
    const currentFormation = formations[currentFrameIndex];
    if (!currentFormation) return;

    currentFormation.positions.forEach((pos) => {
      const drawX = (pos.x / 1000) * size;
      const drawY = (pos.y / 1000) * size;
      const isMe = pos.memberNumber === myNumber;

      ctx.beginPath();
      ctx.arc(drawX, drawY, isMe ? size * 0.025 : size * 0.016, 0, Math.PI * 2);

      if (isMe) {
        ctx.fillStyle = '#ea580c'; // 自分：オレンジ
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
      } else {
        ctx.fillStyle = '#3b82f6'; // 他人：青
        ctx.strokeStyle = 'transparent';
      }
      ctx.fill();
      if (isMe) ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = isMe ? `bold ${size * 0.022}px sans-serif` : `${size * 0.016}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(pos.memberNumber), drawX, drawY);
    });
  }, [formations, currentFrameIndex, myNumber]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '90vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      <header style={{ backgroundColor: '#ffffff', padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>ダンス位置確認ビュー（出演者用）</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>現在：{formations[currentFrameIndex]?.name}</p>
        </div>
        
        <div>
          <label style={{ fontSize: '14px', marginRight: '8px', fontWeight: 'bold' }}>自分の番号:</label>
          <select 
            style={{ padding: '6px', fontSize: '14px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            onChange={(e) => setMyNumber(e.target.value ? Number(e.target.value) : null)}
            defaultValue=""
          >
            <option value="">全体を表示</option>
            {formations[0]?.positions.map((pos) => (
              <option key={pos.memberNumber} value={pos.memberNumber}>{pos.memberNumber} 番</option>
            ))}
          </select>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', backgroundColor: '#0f172a' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', maxWidth: '500px', maxHeight: '500px', backgroundColor: '#ffffff', borderRadius: '8px' }} />
      </main>

      <footer style={{ backgroundColor: '#ffffff', padding: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', overflowX: 'auto' }}>
        {formations.map((form, index) => (
          <button
            key={form.id}
            onClick={() => setCurrentFrameIndex(index)}
            style={{
              flex: 1,
              padding: '16px',
              fontSize: '14px',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: currentFrameIndex === index ? '#ea580c' : '#f1f5f9',
              color: currentFrameIndex === index ? '#ffffff' : '#334155',
              whiteSpace: 'nowrap'
            }}
          >
            {form.name}
          </button>
        ))}
      </footer>
    </div>
  );
};
