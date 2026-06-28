import { FC } from "react";

interface MasonryItem {
  id: string;
  img: string;
  url: string;
  height: number;
  [key: string]: unknown;
}

interface MasonryProps {
  items?: MasonryItem[];
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: string;
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
  onItemClick?: (idx: number) => void;
}

declare const Masonry: FC<MasonryProps>;
export default Masonry;
