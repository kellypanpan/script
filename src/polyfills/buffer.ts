import { Buffer } from 'buffer';
// Attach Buffer to global window so libraries expecting Node Buffer work in browser
if (typeof window !== 'undefined' && !(window as any).Buffer) {
  (window as any).Buffer = Buffer;
} 