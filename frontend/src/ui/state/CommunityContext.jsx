import React, { useCallback, useReducer, useRef } from 'react';
import { communityReducer, initialCommunity } from './communityReducer';
import { CommunityContext } from './CommunityStore';
import '../styles/refinement.css';

// Serialize synchronous demo actions against the latest state, including batched actions.
// The domain reducer remains the single authority for validation and permissions.
export function reduceAction(state, action) {
  const next = communityReducer({ ...state, notice: '', noticeKind: 'success' }, action);
  return { ok: next.noticeKind !== 'error', state: next, error: next.noticeKind === 'error' ? next.notice : '' };
}
export function CommunityProvider({ children }) {
  const [state, publish] = useReducer((previous, next) => next, undefined, initialCommunity);
  const current = useRef(state);
  const dispatch = useCallback(action => {
    const result = reduceAction(current.current, action);
    current.current = result.state;
    publish(result.state);
    return result;
  }, []);
  return <CommunityContext.Provider value={{ ...state, dispatch, activePlayer: state.players.find(player => player.id === state.activePlayerId) }}>{children}</CommunityContext.Provider>;
}
export { useCommunity } from './CommunityStore';
