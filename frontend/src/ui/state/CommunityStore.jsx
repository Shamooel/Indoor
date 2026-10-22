import { createContext, useContext } from 'react';
export const CommunityContext = createContext(null);
export function useCommunity() { return useContext(CommunityContext); }
