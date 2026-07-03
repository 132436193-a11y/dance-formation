// AdminEditor.tsx
import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// 1. 型定義（出演者用と共通の構造）
// ==========================================
interface Position {
  memberNumber: number;
  x: number; // 0〜1000の相対座標
  y: number;
}

// ==========================================
// 2. メイン編集コンポーネント（管理者画面）
// ==========================================
export const AdminEditor: React.FC = () => {
  const [totalCount, setTotalCount] = useState<number>(70); // 編集対象の人数（初期値70人）
  const [positions, setPositions] = useState<Position[]>([]); // 現在の70人の位置データ
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedNumber, setDraggedNumber] = useState<number | null>(null); // 今掴んでいる人の番号
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 初回読み込み時に、初期配置として「横一列」を生成
  useEffect(() => {
    applyTemplate('line');
  }, [totalCount]);

  // ==========================================
  // 3. テンプレート自動配置ロジック
  // ==========================================
  const applyTemplate = (type: 'line' | 'circle' | 'vShape') => {
    const newPositions: Position[] = [];

    for (let i = 0; i < totalCount; i++) {
      const num = i + 1;
      let x = 500;
      let y = 500;

      if (type === 'line') {
        // 【横一列】左右均等に綺麗に並べる
        x = 150 + (i / (totalCount - 1)) * 700;
        y = 550;
      } else if (type === 'circle') {
        // 【円形】中心(500, 550)から半径300の円
        const angle = (i / totalCount) * 2 * Math.PI;
        x = 500 + Math.cos(angle) * 300;
        y = 550 + Math.sin(angle) * 300;
      } else if (type === 'vShape') {
        // 【V字】半分に分けて左右斜め上に広げる
        const isLeft = i < totalCount / 2;
        const step = isLeft ? i : i - Math.floor(totalCount / 2);
        x = isLeft ? 500 - step * 12 : 500 + step * 12;
        y = 300 + step * 15;
      }

      newPositions.push({ memberNumber: num, x, y });
    }
    setPositions(newPositions);
  };

  // ==========================================
  // 4. マウス・タッチでのドラッグ＆ドロップ処理
  // ==========================================
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // クリックされたCanvas内の座標（ピクセル）を取得
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const size = canvas.width;

    // クリックされた位置が、誰かの丸（半径）の中に落ちているか判定
    // 実際のピクセル座標から、内部の「0〜1000の仮想座標」に逆変換して計算
    const clickVirtualX = (mouseX / size) * 1000;
    const clickVirtualY = (mouseY / size) * 1000;

    // クリック位置に一番近い人を探す（当たり判定）
    const hit = positions.find((pos) => {
      const distance = Math.sqrt(
        Math.pow(pos.x - clickVirtualX, 2) + Math.pow(pos.y - clickVirtualY, 2)
      );
      return distance < 25; // 判定半径（25マス以内なら掴める）
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
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const size = canvas.width;

    // マウス位置に合わせて仮想座標(0〜1000)をリアルタイムに計算
    let newX = (mouseX / size) * 1000;
    let newY = (mouseY / size) * 1000;

    // 画面外に飛び出さないように制限(0〜1000の間)
    newX = Math.max(20, Math.min(980, newX));
    newY = Math.max(20, Math.min(980, newY));

    // 対象の生徒の座標だけを更新
    setPositions((prev) =>
      prev.map((pos) =>
        pos.memberNumber === draggedNumber ? { ...pos, x: newX, y: newY } : pos
      )
    );
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDraggedNumber(null);
  };

  // ==========================================
  // 5. Canvasの描画処理（出演者用とベースは同じ）
  // ==========================================
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

    // 背景：センターライン（点線）
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, size * 0.55); ctx.lineTo(size, size * 0.55); ctx.stroke();
    ctx.setLineDash([]);

    // 70人の描画
    positions.forEach((pos) => {
      const drawX = (pos.x / 1000) * size;
      const drawY = (pos.y / 1000) * size;
      const isSelected = pos.memberNumber === draggedNumber;

      ctx.beginPath();
      ctx.arc(drawX, drawY, size * 0.016, 0, Math.PI * 2);
      
      // ドラッグ中の生徒は赤くして目立たせる
      ctx.fillStyle = isSelected ? '#ef4444' : '#3b82f6';
      ctx.fill();

      // 番号
      ctx.fillStyle = '#ffffff';
      ctx.font = `${size * 0.015}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(pos.memberNumber), drawX, drawY);
    });
  }, [positions, draggedNumber]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' }}>
      
      {/* 上部：管理ヘッダー */}
      <header style={{ backgroundColor: '#ffffff', padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyBetween: 'center', alignItems: 'center', gap: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>フォーメーション作成（管理者用）</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>テンプレを選んだあと、丸をマウスで直接動かして微調整できます</p>
        </div>

        {/* 人数設定（70人以外にも簡単に変更可能） */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>人数:</label>
          <input 
            type="number" 
            value={totalCount} 
            onChange={(e) => setTotalCount(Math.max(1, Math.min(150, Number(e.target.value))))}
            style={{ width: '60px', padding: '4px', fontSize: '14px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
          <span style={{ fontSize: '14px' }}>人</span>
        </div>
      </header>

      {/* メイン編集エリア */}
      <div style={{ flex: 1, display: 'flex', padding: '16px', gap: '16px' }}>
        
        {/* 左側サイドバー：テンプレ選択ボタン */}
        <aside style={{ width: '200px', backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'col', gap: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#475569' }}>⚙️ 一発自動配置</h3>
          
          <button onClick={() => applyTemplate('line')} style={buttonStyle}>↔️ 横一列に並べる</button>
          <button onClick={() => applyTemplate('circle')} style={buttonStyle}>⭕ 円形に並べる</button>
          <button onClick={() => applyTemplate('vShape')} style={buttonStyle}>🔼 V字に並べる</button>

          <div style={{ marginTop: 'auto', fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>
            ※ここで綺麗に整列させてから、個別にドラッグして仕上げると早いです。
          </div>
        </aside>

        {/* 中央：編集用キャンバス */}
        <main style={{ flex: 1, backgroundColor: '#0f172a', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
          <canvas 
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp} // 画面外に出たらドラッグ終了
            style={{ width: '100%', height: '100%', maxWidth: '550px', maxHeight: '550px', backgroundColor: '#ffffff', borderRadius: '8px', cursor: isDragging ? 'grabbing' : 'grab' }}
          />
        </main>
      </div>
    </div>
  );
};

// ボタンの共通簡易スタイル
const buttonStyle = {
  padding: '12px',
  fontSize: '14px',
  fontWeight: 'bold',
  backgroundColor: '#f1f5f9',
  color: '#334155',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  cursor: 'pointer',
  textAlign: 'left' as const,
};
