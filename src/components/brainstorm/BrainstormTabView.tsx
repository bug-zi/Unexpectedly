/**
 * 灵感风暴 - 主布局容器
 */

import { ReactNode, useState } from 'react';
import { useBrainstormStore } from '@/stores/brainstormStore';
import { useDiffuserStore } from '@/stores/diffuserStore';
import { useBrainstormEngine } from '@/hooks/useBrainstormEngine';
import { StagePanel } from './StagePanel';
import { ShowcasePanel } from './CollectionBox';
import { ControlBar } from './ControlBar';
import { ControlHub } from './ControlHub';

interface BrainstormTabViewProps {
  children: ReactNode; // 共享画布
}

export function BrainstormTabView({ children }: BrainstormTabViewProps) {
  const showcase = useBrainstormStore((s) => s.showcase);
  const discardPile = useBrainstormStore((s) => s.discardPile);
  const activityLog = useBrainstormStore((s) => s.activityLog);
  const topicInput = useBrainstormStore((s) => s.topicInput);
  const phase = useBrainstormStore((s) => s.phase);
  const currentRound = useBrainstormStore((s) => s.currentRound);
  const totalRounds = useBrainstormStore((s) => s.totalRounds);
  const moveToCollection = useBrainstormStore((s) => s.moveToCollection);
  const discardFromShowcase = useBrainstormStore((s) => s.discardFromShowcase);
  const setTopicInput = useBrainstormStore((s) => s.setTopicInput);
  const resetSession = useBrainstormStore((s) => s.resetSession);

  const engine = useBrainstormEngine();
  const [showControlHub, setShowControlHub] = useState(false);

  const handleClear = () => {
    resetSession();
    useDiffuserStore.getState().clearCanvas();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 flex min-h-0">
        {/* 左侧：阶段面板 */}
        <StagePanel
          phase={phase}
          currentRound={currentRound}
          totalRounds={totalRounds}
          activityLog={activityLog}
        />

        {/* 中间：共享画布 */}
        <div className="flex-1 relative min-w-0">
          {children}
        </div>

        {/* 右侧：展台 */}
        <ShowcasePanel
          showcase={showcase}
          discarded={discardPile}
          onAdopt={moveToCollection}
          onDiscard={discardFromShowcase}
        />
      </div>

      {/* 底部：控制栏 */}
      <ControlBar
        phase={phase}
        currentRound={currentRound}
        totalRounds={totalRounds}
        collectedCount={useBrainstormStore((s) => s.collectionBox).length}
        topicInput={topicInput}
        onTopicChange={setTopicInput}
        onStart={engine.start}
        onPause={engine.pause}
        onResume={engine.resume}
        onRestart={engine.restart}
        onClear={handleClear}
        isConfigured={engine.isConfigured}
        onOpenControlHub={() => setShowControlHub(true)}
      />

      {/* 控制中枢弹窗 */}
      <ControlHub
        isOpen={showControlHub}
        onClose={() => setShowControlHub(false)}
      />
    </div>
  );
}
