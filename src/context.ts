import React from 'react';
import type { ScrollContextType } from './types';

const DEFAULT_CONTEXT = {
  selected: '',
  refs: {},
  scrollTo: () => {},
  registerRef: () => null,
};

export const ScrollContext = React.createContext<ScrollContextType>(
  DEFAULT_CONTEXT,
);

export const { Consumer, Provider } = ScrollContext;
