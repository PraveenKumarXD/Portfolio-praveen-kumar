import { FC } from "react";

interface FlowingMenuProps {
  items?: { text: string; image: string; link: string; description?: string; [key: string]: unknown }[];
  speed?: number;
  textColor?: string;
  bgColor?: string;
  marqueeBgColor?: string;
  marqueeTextColor?: string;
  borderColor?: string;
  onItemClick?: (idx: number) => void;
}

declare const FlowingMenu: FC<FlowingMenuProps>;
export default FlowingMenu;
