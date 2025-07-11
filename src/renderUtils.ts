import { Node } from "yoga-layout";

type Dim = {
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
};

type RectChars = {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  horizontal: string;
  vertical: string;
};

export const heavy: RectChars = {
  topLeft: "┏",
  topRight: "┓",
  bottomLeft: "┗",
  bottomRight: "┛",
  horizontal: "━",
  vertical: "┃",
};

export const light: RectChars = {
  topLeft: "┌",
  topRight: "┐",
  bottomLeft: "└",
  bottomRight: "┘",
  horizontal: "─",
  vertical: "│",
};

export const doubleLine: RectChars = {
  horizontal: "═",
  vertical: "║",
  topLeft: "╔",
  topRight: "╗",
  bottomLeft: "╚",
  bottomRight: "╝",
};

export function drawRect(rows: string[], dims: Dim, style: RectChars) {
  for (let i = dims.top; i < dims.top + dims.height; i++) {
    let rectRow = style.vertical + " ".repeat(dims.width - 2) + style.vertical;
    if (i === dims.top) {
      rectRow =
        style.topLeft +
        style.horizontal.repeat(dims.width - 2) +
        style.topRight;
    } else if (i === dims.top + dims.height - 1) {
      rectRow =
        style.bottomLeft +
        style.horizontal.repeat(dims.width - 2) +
        style.bottomRight;
    }
    replaceStrAt(rows, i, dims.left, rectRow);
  }
}

export function replaceStrAt(
  rows: string[],
  row: number,
  column: number,
  str: string
) {
  while (row >= rows.length) {
    rows.push("");
  }
  while (column >= rows[row].length) {
    rows[row] += " ";
  }
  rows[row] =
    rows[row].substring(0, column) +
    str +
    rows[row].substring(column + str.length);
}

export function getGlobalDims(node: Node): Dim {
  const dims = getDims(node);
  let parent = node.getParent();
  while (parent) {
    const parentDims = getDims(parent);
    dims.left += parentDims.left;
    dims.top += parentDims.top;
    dims.right += parentDims.left;
    dims.bottom += parentDims.top;
    parent = parent.getParent();
  }
  return dims;
}

function getDims(node: Node): Dim {
  return {
    width: node.getComputedWidth(),
    height: node.getComputedHeight(),
    top: node.getComputedTop(),
    left: node.getComputedLeft(),
    right: node.getComputedLeft() + node.getComputedWidth(),
    bottom: node.getComputedTop() + node.getComputedHeight(),
  };
}
