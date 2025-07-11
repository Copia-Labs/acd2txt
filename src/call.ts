import { Yoga, Align, Edge, FlexDirection, Node } from "yoga-layout/load";
import { getGlobalDims, drawRect, heavy, replaceStrAt } from "./renderUtils";
import { callIsContact, createContact } from "./contact";
import { NTCallStatement } from "./neutralText/grammarWrapper";

export type CallStatementWithNode = NTCallStatement & {
  node: Node;
};

export function createCall(
  yoga: Yoga,
  call: NTCallStatement,
  parent: Node
): CallStatementWithNode {
  const maybeContact = call;
  if (callIsContact(maybeContact)) {
    return createContact(yoga, maybeContact, parent);
  }

  const node = yoga.Node.create();

  node.setMargin(Edge.Horizontal, 1);
  node.setFlexDirection(FlexDirection.Row);
  parent.insertChild(node, parent.getChildCount());

  const argBox = yoga.Node.create();
  argBox.setAlignItems(Align.FlexEnd);
  argBox.setPadding(Edge.Top, 2);
  node.insertChild(argBox, node.getChildCount());

  const callBox = yoga.Node.create();
  callBox.setPadding(Edge.Vertical, 1);
  callBox.setPadding(Edge.Horizontal, 2);

  callBox.setHeight(3 + call.arguments.length);
  node.insertChild(callBox, node.getChildCount());

  const calleeNode = yoga.Node.create();
  calleeNode.setWidth(call.callee.length);
  calleeNode.setHeight(1);
  callBox.insertChild(calleeNode, callBox.getChildCount());

  for (let arg of call.arguments) {
    const argNode = yoga.Node.create();
    argNode.setWidth((arg || "").length + 1);
    argNode.setHeight(1);
    argBox.insertChild(argNode, argBox.getChildCount());
  }

  return { ...call, node };
}

export function renderCall(rows: string[], call: CallStatementWithNode) {
  const callBox = call.node.getChild(1);
  const callDim = getGlobalDims(callBox);
  drawRect(rows, callDim, heavy);
  replaceStrAt(rows, callDim.top + 1, callDim.left, `┨`);
  replaceStrAt(rows, callDim.top + 1, callDim.right - 1, `┠`);
  const calleeDim = getGlobalDims(callBox.getChild(0));
  replaceStrAt(rows, calleeDim.top, calleeDim.left, call.callee);
  const argBox = call.node.getChild(0);
  for (let i = 0; i < argBox.getChildCount(); i++) {
    const argNode = argBox.getChild(i);
    const argDim = getGlobalDims(argNode);
    replaceStrAt(rows, argDim.top, argDim.left, call.arguments[i] + " ┨");
  }
}
