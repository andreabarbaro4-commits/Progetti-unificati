import type { Client } from './types';

/**
 * The fixed "Internal" sentinel client. Every environment must contain exactly
 * one client with `isInternal: true` — projects with no external client
 * reference this id as their `clientId` (Req 13.2, 15.7).
 */
export const INTERNAL_CLIENT_ID = 'client-internal';

export const mockClients: Client[] = [
  {
    id: INTERNAL_CLIENT_ID,
    name: 'Internal',
    isInternal: true,
  },
  {
    id: 'client-acme',
    name: 'Acme Corp',
  },
  {
    id: 'client-globex',
    name: 'Globex Industries',
  },
  {
    id: 'client-initech',
    name: 'Initech LLC',
  },
  {
    id: 'client-demo',
    name: 'Demo',
  },
  {
    id: 'client-rome-future-week',
    name: 'Rome Future Week',
  },
  {
    id: 'client-silicon-drinkabout',
    name: 'Silicon Drinkabout',
  },
  {
    id: 'client-slush',
    name: 'Slush',
  },
  {
    id: 'client-web-summit',
    name: 'Web Summit',
  },
];
