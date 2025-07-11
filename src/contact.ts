import { CallStatementWithNode } from "./call";
import { Yoga, Align, Edge, Node } from "yoga-layout/load";
import { getGlobalDims, replaceStrAt } from "./renderUtils";
import { NTCallStatement } from "./neutralText/grammarWrapper";

export type Contact = CallStatementWithNode & {
  callee: "XIC" | "OTE" | "XIO";
  opNode: Node;
  symbolNode: Node;
};

type Pos = {
  row: number;
  col: number;
};

export type ContactStatement = NTCallStatement & {
  callee: "XIC" | "OTE" | "XIO";
};

export function callIsContact(c: NTCallStatement): c is ContactStatement {
  return c.callee === "XIC" || c.callee === "OTE" || c.callee === "XIO";
}

export function createContact(
  yoga: Yoga,
  c: ContactStatement,
  parent: Node
): Contact {
  const contact = yoga.Node.create();
  contact.setAlignItems(Align.Center);
  contact.setMargin(Edge.Horizontal, 1);
  parent.insertChild(contact, parent.getChildCount());

  const contactOpNode = yoga.Node.create();
  const opName = c.arguments[0] || "";
  contactOpNode.setWidth(opName.length);
  contactOpNode.setHeight(1);
  contact.insertChild(contactOpNode, 0);

  const contactSymbol = yoga.Node.create();
  contactSymbol.setWidth(3);
  contactSymbol.setHeight(1);
  contact.insertChild(contactSymbol, 1);

  return {
    ...c,
    node: contact,
    opNode: contactOpNode,
    symbolNode: contactSymbol,
  };
}

type ContactWithPos = Contact & {
  opPos: Pos;
  symPos: Pos;
};

function getContactPositions(contact: Contact): ContactWithPos {
  const symDim = getGlobalDims(contact.symbolNode);
  const symPos: Pos = {
    row: symDim.top,
    col: symDim.left,
  };
  const opDim = getGlobalDims(contact.opNode);
  const opPos: Pos = {
    row: opDim.top,
    col: opDim.left,
  };
  return {
    ...contact,
    symPos,
    opPos,
  };
}

const symbols = {
  XIC: "┨ ┠",
  OTE: "( )",
  XIO: "┨/┠",
};

export function renderContact(rows: string[], contact: Contact) {
  const operand = contact.arguments[0] || "";
  const contactWithPos = getContactPositions(contact);
  replaceStrAt(
    rows,
    contactWithPos.opPos.row,
    contactWithPos.opPos.col,
    operand
  );
  let symbol = symbols[contact.callee];
  replaceStrAt(
    rows,
    contactWithPos.symPos.row,
    contactWithPos.symPos.col,
    symbol
  );
}
