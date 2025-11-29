export interface CardData {
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  generalEmail?: string;
  website: string;
  linkedin?: string;
  github?: string;
  address: string;
  logoUrl: string;
  frontBgColor?: string;
  backBgColor?: string;
}

export enum CardSide {
  FRONT = 'front',
  BACK = 'back'
}