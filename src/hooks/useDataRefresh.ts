/**
 * Data refresh utility for updating page component data on login/logout
 */

import { useEffect, useRef } from 'react';

export function refreshAllUserData() {
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

export function triggerGlobalDataRefresh() {
  window.dispatchEvent(new CustomEvent('user-data-changed'));
}

export function useOnChangeData(callback: any) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = () => callbackRef.current();

    window.addEventListener('user-data-changed', handler);
    window.addEventListener('user-logged-in', handler);
    window.addEventListener('user-logged-out', handler);

    return () => {
      window.removeEventListener('user-data-changed', handler);
      window.removeEventListener('user-logged-in', handler);
      window.removeEventListener('user-logged-out', handler);
    };
  }, []);
}
