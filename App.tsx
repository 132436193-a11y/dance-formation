// App.tsx
import React, { useState } from 'react';
import { PerformerViewer } from './Viewer';
import { AdminEditor } from './AdminEditor';

// ==========================================
// 1. 共通のデータ構造（型定義）
// ==========================================
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
  // 管理者モードと出演者モードを切り替えるフラグ（テスト用）
  const [isAdminMode, setIsAdminMode] = useState<boolean>(true);
  
  // 総人数
  const [totalCount, setTotalCount] = useState<number>(70);

  // 全てのフォーメーションコマを管理する主データ
  const [formations, setFormations] = useState<Formation[]>([
    {
      id: 'f1',
      name: '① オープニング',
      positions: Array.from({ length: 70 }, (_, i) => ({
        memberNumber: i + 1,
        x: 150 + (i / 69) * 700, // 初期値：横一列
        y: 550,
      })),
    },
  ]);

  // 現在表示・編集しているコマのインデックス
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);

  // ==========================================
  // 2. データ更新用の関数（子コンポーネントに渡す）
  // ==========================================
  
  // 特定のコマの全員の座標を上書き保存する
  const updatePositions = (newPositions: Position[]) => {
    setFormations((prev) =>
      prev.map((form, index) =>
        index === currentFrameIndex ? { ...form, positions: newPositions } : form
      )
    );
  };

  // 新しい空のコマ（前のコマを引き継ぐ）を追加する
  const addNewFormation = () => {
    const currentForm = formations[currentFrameIndex];
    const newId = `f_${Date.now()}`;
    const newIndex = formations.length + 1;
    
    const newForm: Formation = {
      id: newId,
      name: `コマ ${newIndex}`,
      // 編集しやすいよう、現在の配置を引き継いでコピーする
      positions: [...currentForm.positions],
    };

    setFormations([...formations, newForm]);
    setCurrentFrameIndex(formations.length); // 追加したコマに移動
  };

  // コマのタイトル（名前）を変更する
  const renameFormation = (newName: string) => {
    setFormations((prev) =>
      prev.map((form, index) =>
        index === currentFrameIndex ? { ...form, name: newName } : form
      )
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      
      {/* モード切り替えバー（開発・テスト用の最上部メニュー） */}
      <div style={{ backgroundColor: '#1e293b', color: '#ffffff', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
          🌐 ダンスフォーメーションアプリ（テスト環境）
        </span>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setIsAdminMode(true)}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 'bold',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: isAdminMode ? '#2563eb' : '#475569',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            🛠️ 管理者画面をテスト
          </button>
          <button 
            onClick={() => setIsAdminMode(false)}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 'bold',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: !isAdminMode ? '#ea580c' : '#475569',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            📱 出演者画面をテスト
          </button>
        </div>
      </div>

      {/* メインコンテンツ：モードに応じて画面を切り替える */}
      <div style={{ flex: 1 }}>
        {isAdminMode ? (
          /* ==========================================
             管理者エディター画面（親のデータと関数を繋ぐ）
             ========================================== */
          <div style={{ display: 'flex', flexDirection: 'column', height: '90vh' }}>
            {/* タイムライン操作バー */}
            <div style={{ backgroundColor: '#ffffff', padding: '12px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '15px', overflowX: 'auto' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#64748b', whitespace: 'nowrap' }}>
                🎬 タイムライン:
              </span>
              
              {formations.map((form, index) => (
                <button
                  key={form.id}
                  onClick={() => setCurrentFrameIndex(index)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: currentFrameIndex === index ? '#2563eb' : '#f8fafc',
                    color: currentFrameIndex === index ? '#ffffff' : '#334155',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {form.name}
                </button>
              ))}

              <button 
                onClick={addNewFormation}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                ➕ 次のコマを追加
              </button>

              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>コマ名変更:</span>
                <input 
                  type="text"
                  value={formations[currentFrameIndex].name}
                  onChange={(e) => renameFormation(e.target.value)}
                  style={{ padding: '6px', fontSize: '13px', borderRadius: '4px', border: '1px solid #cbd5e1', width: '150px' }}
                />
              </div>
            </div>

            {/* 管理者用編集エリア本体（既存のエディタコードを流用できるように内包） */}
            <div style={{ flex: 1 }}>
              <AdminEditor 
                totalCount={totalCount}
                setTotalCount={setTotalCount}
                positions={formations[currentFrameIndex].positions}
                setPositions={updatePositions}
              />
            </div>
          </div>
        ) : (
          /* ==========================================
             出演者ビューアー画面（同じデータを共有して表示）
             ========================================== */
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
