import { ReactElement, ReactNode } from 'react';
import { NextComponentType, NextPageContext } from 'next';

export type GetLayoutFunction = (n: ReactNode) => ReactElement;
export type PageComponent = NextComponentType<NextPageContext, any, {}> & { getLayout?: GetLayoutFunction }
