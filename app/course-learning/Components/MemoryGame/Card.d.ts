import { FC } from 'react';

export interface CardType {
  text: string;
  pair: string;
  matched: boolean;
  id: string;
  isKeyword: boolean;
}

export interface CardProps {
  card: CardType;
  handleChoice: (card: CardType) => void;
  flipped: boolean;
  disabled: boolean;
}

declare const Card: FC<CardProps>;
export default Card; 