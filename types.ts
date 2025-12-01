export interface TeamMember {
  name: string;
  role: string;
  phone: string;
  whatsapp?: string;
}

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
  teamMembers?: TeamMember[];
}

export enum CardSide {
  FRONT = 'front',
  BACK = 'back'
}