import type { StarData } from '../../lib/types';

import exploreStar from './explore-star.json';
import createStar from './create-star.json';
import techStar from './tech-star.json';
import connectStar from './connect-star.json';
import natureStar from './nature-star.json';
import orderStar from './order-star.json';
import communicateStar from './communicate-star.json';
import challengeStar from './challenge-star.json';

export const ALL_STARS: StarData[] = [
  exploreStar,
  createStar,
  techStar,
  connectStar,
  natureStar,
  orderStar,
  communicateStar,
  challengeStar,
] as unknown as StarData[];

export {
  exploreStar,
  createStar,
  techStar,
  connectStar,
  natureStar,
  orderStar,
  communicateStar,
  challengeStar,
};
