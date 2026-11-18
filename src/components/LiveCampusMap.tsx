import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { InteractiveCampusMap } from './InteractiveCampusMap';
import type { Bus } from '../context/TransitContext';

interface LiveCampusMapProps {
  buses: Bus[];
  onSelectBus?: (busId: number) => void;
  compact?: boolean;
  focusBus?: string | null;
}

export const LiveCampusMap: React.FC<LiveCampusMapProps> = (props) => (
  <ErrorBoundary fallbackTitle="Campus Map Telemetry">
    <InteractiveCampusMap {...props} />
  </ErrorBoundary>
);
