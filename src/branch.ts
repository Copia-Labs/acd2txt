import {
  Yoga,
  Edge,
  FlexDirection,
  Node,
  Justify,
  Align,
} from "yoga-layout/load";
import {
  createRungRow,
  StatementWithNodes,
} from "./renderRungs";
import { NTBranchStatement } from "./neutralText/grammarWrapper";

export type BranchWithNode = NTBranchStatement & {
  node: Node;
  branchRow: BranchRow[];
};

export type BranchRow = {
  node: Node;
  row: StatementWithNodes[];
};

export function createBranch(
  yoga: Yoga,
  branch: NTBranchStatement,
  parent: Node
): BranchWithNode {
  const branchNode = yoga.Node.create();
  branchNode.setPadding(Edge.Horizontal, 2);
  const branches: BranchRow[] = branch.rungs.map((b) => {
    const rowNode = yoga.Node.create();
    rowNode.setFlexDirection(FlexDirection.Row);
    rowNode.setPadding(Edge.Bottom, 1);
    rowNode.setPadding(Edge.Left, 1);
    rowNode.setWidthPercent(100);
    rowNode.setJustifyContent(Justify.Center);
    rowNode.setAlignItems(Align.FlexStart);
    branchNode.insertChild(rowNode, branchNode.getChildCount());
    return { node: rowNode, row: createRungRow(yoga, b, rowNode) };
  });
  parent.insertChild(branchNode, parent.getChildCount());
  return {
    ...branch,
    node: branchNode,
    branchRow: branches,
  };
}
