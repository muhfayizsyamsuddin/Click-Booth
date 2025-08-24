import { ObjectId as MongoObjectId } from "mongodb";

export type ObjectId = string;

export type NewPhotoInput = {
  userId?: ObjectId | null;
  url: string;
  publicId?: string;
  frame?: string;
  stickers?: string[];
  watermark?: string;
  enhancedUrl?: string;
  aiEnhanced?: boolean;
};

export type UploadBody = {
  imageData: string;
  frame?: string;
  stickers?: string[];
  watermark?: string;
  downloadOnly?: boolean;
};

export interface UserType {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  tokens: number;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export interface Photo {
  _id?: ObjectId;
  userId: ObjectId | null;
  url: string;
  publicId?: string;
  imageUrl?: string;
  frame?: string;
  stickers?: string[];
  watermark?: string;
  enhancedUrl?: string;
  aiEnhanced?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface PhotoDoc {
  _id?: MongoObjectId;
  userId?: MongoObjectId | null;
  url: string;
  publicId?: string;
  imageUrl?: string;
  frame?: string;
  stickers?: string[];
  watermark?: string;
  enhancedUrl?: string;
  aiEnhanced?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
