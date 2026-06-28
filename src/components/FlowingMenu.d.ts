import { FC } from "react";

interface FlowingMenuProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items?: any[];
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
