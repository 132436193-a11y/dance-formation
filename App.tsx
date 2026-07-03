// App.tsx
import React, { useState } from 'react';
import { PerformerViewer } from './Viewer';
import { AdminEditor } from './AdminEditor';

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

export const App: React.FC = () => {
  const [isAdminMode, setIsAdminMode] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(70);

  const [formations, setFormations] = useState<Formation[]>([
    {
      id: 'f1',
      name: '① オープニング',
      positions: Array.from({ length: 70 }, (_, i) => ({
        memberNumber: i + 1,
        x: 150 + (i / 69) * 700,
        y: 550,
      })),
    },
  ]);

  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);

  const updatePositions = (newPositions: Position[]) => {
    setFormations((prev) =>
      prev.map((form, index) =>
        index === currentFrameIndex ? { ...form, positions: newPositions } : form
      )
    );
  };

  const addNewFormation = () => {
    const currentForm = formations[currentFrameIndex];
    const newId = `f_${Date.now()}`;
    const newIndex = formations.length + 1;
    
    const newForm: Formation = {
      id: newId,
      name: `コマ ${newIndex}`,
      positions: [...currentForm.positions],
    };

    setFormations([...formations, newForm]);
    setCurrentFrameIndex(formations.length);
  };

  const renameFormation = (newName: string) => {
    setFormations((prev) =>
      prev.map((form, index) =>
        index === currentFrameIndex ? { ...form, name: newName } : form
      )
    );
  };

  return (
    <div style={{ padding: '10px', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif', minHeight: '100vh' }}>
      
      {/* 1. モード切り替え（最上部） */}
      <div style={{ backgroundColor: '#1e293b', color: '#ffffff', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <b style={{ fontSize: '14px' }}>🕺 フォーメーション作成ツール</b>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setIsAdminMode(true)} style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', backgroundColor: isAdminMode ? '#2563eb' : '#475569', color: '#white', border: 'none', borderRadius: '4px' }}>🛠️ 管理者</button>
          <button onClick={() => setIsAdminMode(false)} style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', backgroundColor: !isAdminMode ? '#ea580c' : '#475569', color: '#white', border: 'none', borderRadius: '4px' }}>📱 出演者</button>
        </div>
      </div>

      {/* 2. 管理者モードの時のタイムライン操作（キャンバスの上に配置して絶対に見えるように変更） */}
      {isAdminMode && (
        <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '8px', paddingBottom: '4px' }}>
            {formations.map((form, index) => (
              <button
                key={form.id}
                onClick={() => setCurrentFrameIndex(index)}
                style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: currentFrameIndex === index ? '#2563eb' : '#f8fafc', color: currentFrameIndex === index ? '#ffffff' : '#334155', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {form.name}
              </button>
            ))}
            <button onClick={addNewFormation} style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', border: 'none', backgroundColor: '#10b981', color: '#ffffff', cursor: 'pointer', whiteSpace: 'nowrap' }}>➕ コマ追加</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <span>コマ名変更:</span>
            <input type="text" value={formations[currentFrameIndex].name} onChange={(e) => renameFormation(e.target.value)} style={{ padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', width: '120px' }} />
            <span style={{ marginLeft: '10px' }}>人数:</span>
            <input type="number" value={totalCount} onChange={(e) => setTotalCount(Math.max(1, Math.min(150, Number(e.target.value))))} style={{ width: '50px', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />人
          </div>
        </div>
      )}

      {/* 3. メイン表示エリア */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {isAdminMode ? (
          <AdminEditor 
            totalCount={totalCount}
            setTotalCount={setTotalCount}
            positions={formations[currentFrameIndex].positions}
            setPositions={updatePositions}
          />
        ) : (
          <PerformerViewer 
            formations={formations}
            currentFrameIndex={currentFrameIndex}
            setCurrentFrameIndex={setCurrentFrameIndex}
          />
        )}
      </div>

    </div>
  );
};
