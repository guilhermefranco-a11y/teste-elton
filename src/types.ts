/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Types globally used inside the application for students and attendance logs
export interface Student {
  id: string;
  name: string;
  registration: string;
  classGroup: string;
  avatarUrl?: string;
  email?: string;
}

export interface PresenceLog {
  id: string;
  studentId: string;
  studentName: string;
  registration: string;
  classGroup: string;
  timestamp: string; // ISO String
  confidence: number; // confidence percentage (e.g. 98)
  status: "Presente" | "Atrasado";
  method: "Manual" | "Facial";
}

// Extends Window to reference globally loaded TensorFlow.js and Teachable Machine libraries
export interface TeachableMachineImageModel {
  getClassNames: () => string[];
  getTotalClasses: () => number;
  predict: (image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, flip?: boolean) => Promise<Array<{ className: string; probability: number }>>;
  predictTopK: (image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, k: number, flip?: boolean) => Promise<Array<{ className: string; probability: number }>>;
}

export interface TeachableMachineWebcam {
  webcam: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  setup: (options?: { width?: number; height?: number; facingMode?: string }) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  update: () => void;
}

export interface TeachableMachineImageSDK {
  load: (modelUrl: string, metadataUrl?: string) => Promise<TeachableMachineImageModel>;
  loadFromFiles: (modelFile: File, weightsFile: File, metadataFile: File) => Promise<TeachableMachineImageModel>;
  Webcam: new (width: number, height: number, flip?: boolean) => TeachableMachineWebcam;
}

declare global {
  interface Window {
    tmImage?: TeachableMachineImageSDK;
    tf?: any;
  }
}
