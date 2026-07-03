// Viewer.tsx
import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// 1. 最小限のデータ構造（型定義）
// ==========================================
interface Position {
  memberNumber: number; // 1〜70などの番号
  x: number;            // 0〜1000の仮想座標（画面サイズが違ってもズレない相対値）
  y: number;            // 0〜1000の仮想座標
}

interface Formation {
  id: string;
  name: string;         // コマ名（例：「①イントロ」「②サビ」）
  positions: Position[];
}

// ==========================================
// 2. 70人規模のテスト用データ（円形からV字への移動）
// ==========================================
const mockFormations: Formation[] = [
  {
    id: 'f1',
    name: '① オープニング（全員で大きな円）',
    positions: Array.from({ length: 70 }, (_, i) => {
      const num = i + 1;
      const angle = (i / 70) * 2 * Math.PI;
      return {
        memberNumber: num,
        x: 500 + Math.cos(angle) * 350, // 中心(500,500)から半径350の円
        y: 550 + Math.sin(angle) * 350,
      };
    }),
  },
  {
    id: 'f2',
    name: '② サビ（綺麗なV字構造）',
    positions: Array.from({ length: 70 }, (_, i) => {
      const num = i + 1;
      const isLeft = i < 35;
      const step = isLeft ? i : i - 35;
      return {
        memberNumber: num,
        x: isLeft ? 500 - step * 12 : 500 + step * 12,
        y: 250 + step * 18,
      };
    }),
  },
];

// ==========================================
// 3. メインビューアーコンポーネント（出演者画面）
// ==========================================
export const PerformerViewer: React.FC = () => {
  const [myNumber, setMyNumber] = useState<number | null>(null); // 選択した自分の番号
  const [currentFrame, setCurrentFrame] = useState<number>(0);   // 現在のコマ（0または1）
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // デバイスの画面サイズに合わせてキャンバスの大きさを調整（縦横比1:1の正方形で固定）
    const size = Math.min(canvas.clientWidth, canvas.clientHeight);
    canvas.width = size;
    canvas.height = size;

    // 背景をクリア
    ctx.clearRect(0, 0, size, size);

    // --- 1. 体育館の床（背景）の描画 ---
    // ステージ（上部のグレーの四角）
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, size, size * 0.12);
    ctx.fillStyle = '#475569';
    ctx.font = `bold ${size * 0.04}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ステージ（前）', size / 2, size * 0.08);

    // センターライン（十字の点線）
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    // 縦の真ん中線
    ctx.beginPath(); ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size); ctx.stroke();
    // 横の真ん中線
    ctx.beginPath(); ctx.moveTo(0, size * 0.55); ctx.lineTo(size, size * 0.55); ctx.stroke();
    ctx.setLineDash([]); // 点線リセット

    // --- 2. 70人の配置描画 ---
    const currentFormation = mockFormations[currentFrame];

    currentFormation.positions.forEach((pos) => {
      // 0〜1000の仮想座標を、実際のスマホ・PCの画面ピクセルサイズに変換
      const drawX = (pos.x / 1000) * size;
      const drawY = (pos.y / 1000) * size;
      const isMe = pos.memberNumber === myNumber;

      // 丸を描く
      ctx.beginPath();
      ctx.arc(drawX, drawY, isMe ? size * 0.025 : size * 0.016, 0, Math.PI * 2);

      if (isMe) {
        ctx.fillStyle = '#ea580c'; // 自分：目立つオレンジ色
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
      } else {
        ctx.fillStyle = '#3b82f6'; // 他人：シンプルな青色
        ctx.strokeStyle = 'transparent';
      }
      ctx.fill();
      if (isMe) ctx.stroke();

      // 番号を丸の中に描く
      ctx.fillStyle = '#ffffff';
      ctx.font = isMe ? `bold ${size * 0.022}px sans-serif` : `${size * 0.016}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(pos.memberNumber), drawX, drawY);
    });
  }, [currentFrame, myNumber]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* 上部：番号選択メニュー */}
      <header style={{ backgroundColor: '#ffffff', padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>ダンス位置確認ビュー（出演者用）</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>現在：{mockFormations[currentFrame].name}</p>
        </div>
        
        <div>
          <label style={{ fontSize: '14px', marginRight: '8px', fontWeight: 'bold' }}>自分の番号:</label>
          <select 
            style={{ padding: '6px', fontSize: '14px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            onChange={(e) => setMyNumber(e.target.value ? Number(e.target.value) : null)}
            defaultValue=""
          >
            <option value="">全体を表示</option>
            {Array.from({ length: 70 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1} 番</option>
            ))}
          </select>
        </div>
      </header>

      {/* 中央：体育館キャンバス */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', backgroundColor: '#0f172a' }}>
        <canvas 
          ref={canvasRef} 
          style={{ width: '100%', height: '100%', maxWidth: '500px', maxHeight: '500px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
      </main>

      {/* 下部：大きく押しやすいコマ切り替えボタン */}
      <footer style={{ backgroundColor: '#ffffff', padding: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
        {mockFormations.map((form, index) => (
          <button
            key={form.id}
            onClick={() => setCurrentFrame(index)}
            style={{
              flex: 1,
              padding: '16px',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: currentFrame === index ? '#2563eb' : '#f1f5f9',
              color: currentFrame === index ? '#ffffff' : '#334155',
              transition: 'all 0.2s'
            }}
          >
            {form.name.split(' ')[0]} {/* 「①」「②」だけをボタンに表示 */}
          </button>
        ))}
      </footer>

    </div>
  );
};
