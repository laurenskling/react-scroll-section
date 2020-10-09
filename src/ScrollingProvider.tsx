import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { debounce } from './utils';
import { Provider } from './context';
import smoothscroll from 'smoothscroll-polyfill';
import type { RefsRegister } from './types';

type Props = {
  debounceDelay?: number;
  scrollBehavior?: 'auto' | 'smooth';
  offset?: number;
  children: ReactNode;
};

const REFS: RefsRegister = {};
if (typeof window !== 'undefined') {
  smoothscroll.polyfill();
}

const ScrollingProvider = ({
  debounceDelay = 50,
  scrollBehavior = 'smooth',
  offset = 0,
  children,
}: Props) => {
  const [selected, setSelected] = useState('');

  useEffect(() => {
    document.addEventListener('scroll', debounceScroll, true);
    handleScroll();
    return () => {
      document.removeEventListener('scroll', debounceScroll, true);
    };
  }, []);

  const handleScroll = () => {
    const selectedSection = Object.keys(REFS).reduce(
      (acc, id) => {
        if (!REFS[id]) return acc;
        const current = REFS[id].current;
        if (!current) return acc;
        const { top } = current.getBoundingClientRect();
        const differenceFromTop = Math.abs(top);

        if (differenceFromTop >= acc.differenceFromTop) return acc;

        return {
          differenceFromTop,
          id,
        };
      },
      {
        differenceFromTop: 9999,
        id: '',
      },
    );

    if (selected !== selectedSection.id) setSelected(selectedSection.id);
  };

  const debounceScroll = debounce(handleScroll, debounceDelay);

  const registerRef = (id: string) => {
    const ref = React.createRef<HTMLElement>();
    REFS[id] = ref;
    return ref;
  };

  const scrollTo = (section: string) => {
    const sectionRef = REFS[section];

    if (!sectionRef) return console.warn('Section ID not recognized!');
    if (!sectionRef.current) return console.warn('SectionRef does not contain a current');

    const top = sectionRef.current.offsetTop + offset;
    setSelected(section);
    window.scrollTo({
      top,
      behavior: scrollBehavior,
    });
  };

  const value = useMemo(
    () => ({
      registerRef,
      scrollTo,
      refs: REFS,
      selected,
    }),
    [selected, REFS],
  );

  return <Provider value={value}>{children}</Provider>;
};

export default ScrollingProvider;
