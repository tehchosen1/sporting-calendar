declare module "dom-to-image" {
  export function toPng(
    node: HTMLElement,
    options?: {
      quality?: number;
      style?: Record<string, string>;
      filter?: (node: HTMLElement) => boolean;
      bgcolor?: string;
      width?: number;
      height?: number;
    }
  ): Promise<string>;

  export function toJpeg(
    node: HTMLElement,
    options?: {
      quality?: number;
      style?: Record<string, string>;
      filter?: (node: HTMLElement) => boolean;
      bgcolor?: string;
      width?: number;
      height?: number;
    }
  ): Promise<string>;

  export function toSvg(
    node: HTMLElement,
    options?: {
      quality?: number;
      style?: Record<string, string>;
      filter?: (node: HTMLElement) => boolean;
      bgcolor?: string;
      width?: number;
      height?: number;
    }
  ): Promise<string>;

  export function toBlob(
    node: HTMLElement,
    options?: {
      quality?: number;
      style?: Record<string, string>;
      filter?: (node: HTMLElement) => boolean;
      bgcolor?: string;
      width?: number;
      height?: number;
    }
  ): Promise<Blob>;

  export function toPixelData(
    node: HTMLElement,
    options?: {
      quality?: number;
      style?: Record<string, string>;
      filter?: (node: HTMLElement) => boolean;
      bgcolor?: string;
      width?: number;
      height?: number;
    }
  ): Promise<Uint8Array>;
}
