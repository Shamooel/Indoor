import React, { createContext, useContext, useReducer } from 'react';
import { communityReducer, initialCommunity } from './communityReducer';

const CommunityContext = createContext(null);
export function CommunityProvider({ children }) {
  const [state, dispatch] = useReducer(communityReducer, undefined, initialCommunity);
  return <CommunityContext.Provider value={{ ...state, dispatch, activePlayer: state.players.find(player => player.id === state.activePlayerId) }}>{children}</CommunityContext.Provider>;
}
export function useCommunity() { return useContext(CommunityContext); }
