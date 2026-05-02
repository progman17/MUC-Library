export const Role = {
  student: 'student',
  admin: 'admin',
} as const;
export type Role = typeof Role[keyof typeof Role];

export const BookFormat = {
  digital: 'digital',
  external: 'external',
  physical: 'physical',
} as const;
export type BookFormat = typeof BookFormat[keyof typeof BookFormat];

export interface User {
  id: string;
  email: string;
  displayName?: string;
  role: Role;
  profilePath?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface College {
  id: string;
  name: string;
  createdAt?: string;
}

export interface Department {
  id: string;
  name: string;
  collegeId: string;
  createdAt?: string;
}

export interface Book {
  id: string;
  title: string;
  description?: string;
  coverPath?: string;
  pdfPath?: string;
  category: string;
  collegeId?: string;
  format?: BookFormat;
  type?: string;
  rating?: number;
  readCount?: number;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
  shelfLocation?: string;
  externalLink?: string;
  colleges?: College;
}
