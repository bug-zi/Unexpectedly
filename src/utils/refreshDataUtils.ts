/**
 * 数据刷新工具
 * 用于在登录/登出时刷新所有页面组件的数据
 */

import { useEffect } from 'react';

/**
 * 从当前用户/游客的存储中重新获取所有数据
 * 确保数据隔离正确
 */
export function refreshAllUserData() {
  // 重新导入 storage 模块，确保使用最新的用户ID
  return import('@/utils/storage').then((storage) => {
    return {
      answers: storage.getAnswers(),
      slotMachine: storage.getSlotMachineResults(),
      turtleSoup: storage.getTurtleSoupRecords(),
      riddles: storage.getRiddleRecords(),
      yesOrNo: storage.getYesOrNoRecords(),
      guessNumber: storage.getGuessNumberRecords(),
      progress: storage.getProgress(),
      favorites: storage.getFavoriteQuestionIds(),
      later: storage.getLaterQuestionIds(),
      collections: storage.getCollections(),
    };
  });
}

/**
 * 触发全局数据刷新事件
 */
export function triggerGlobalDataRefresh() {
  window.dispatchEvent(new CustomEvent('user-data-changed'));
}

/**
 * 监听数据变化并刷新的 Hook
 */
export function onDataChange(callback: () => void) {
  useEffect(() => {
    window.addEventListener('user-data-changed', callback);
    window.addEventListener('user-logged-in', callback);
    window.addEventListener('user-logged-out', callback);

    return () => {
      window.removeEventListener('user-data-changed', callback);
      window.removeEventListener('user-logged-in', callback);
      window.removeEventListener('user-logged-out', callback);
    };
  }, [callback]);
}
