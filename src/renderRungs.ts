import {
  Edge,
  FlexDirection,
  Direction,
  Node as YogaNode,
  Justify,
  Align,
  loadYoga,
  Yoga,
} from "yoga-layout/load";
import { CallStatementWithNode, createCall, renderCall } from "./call";
import { Contact, renderContact } from "./contact";
import {
  getGlobalDims,
  replaceStrAt,
  drawRect,
  doubleLine,
  light,
} from "./renderUtils";
import { BranchWithNode, createBranch } from "./branch";
import { NTRung } from "./neutralText/grammarWrapper";

export type RungRow = Statement[];

export type Statement = CallStatement | BranchStatement;

export type BranchStatement = {
  statement: "branch";
  branches: RungRow[];
};

export type CallStatement = {
  statement: "call";
  callee: string;
  args: string[];
};

export type RungData = {
  rungNum: string;
  rung: NTRung;
};

export async function layoutAndRenderRung(
  rungData: RungData
): Promise<string[]> {
  const rung = await layoutRung(rungData);
  const rows: string[] = [];
  renderRung(rows, rung);
  return rows;
}

export type StatementWithNodes =
  | Contact
  | CallStatementWithNode
  | BranchWithNode;

type RungWithNodes = RungData & {
  node: YogaNode;
  numNode: YogaNode;
  numContentNode: YogaNode;
  statements: StatementWithNodes[];
};

export function createRungRow(
  yoga: Yoga,
  rungRow: NTRung,
  parent: YogaNode
): StatementWithNodes[] {
  return rungRow.map((statement) => {
    if (statement.type === "CallStatement") {
      return createCall(yoga, statement, parent);
    } else if (statement.type === "BranchStatement") {
      return createBranch(yoga, statement, parent);
    } else {
      throw new Error("not implemented yet");
    }
  });
}

async function layoutRung(r: RungData): Promise<RungWithNodes> {
  const yoga = await loadYoga();
  const rung = yoga.Node.create();
  rung.setFlexDirection(FlexDirection.Row);
  rung.setMargin(Edge.Left, 1);
  rung.setPadding(Edge.Right, 2);
  rung.setAlignItems(Align.FlexStart);
  const numNode = createRungNum(yoga, rung);
  const numContentNode = createRungNumContent(yoga, numNode, r.rungNum);
  const statements: StatementWithNodes[] = createRungRow(yoga, r.rung, rung);

  rung.calculateLayout(undefined, undefined, Direction.LTR);

  return {
    ...r,
    statements,
    node: rung,
    numNode,
    numContentNode,
  };
}

function createRungNum(yoga: Yoga, parent: YogaNode): YogaNode {
  const rungNum = yoga.Node.create();
  rungNum.setPadding(Edge.Horizontal, 2);
  rungNum.setPadding(Edge.Vertical, 1);
  rungNum.setHeight(3);
  rungNum.setFlexDirection(FlexDirection.Row);
  rungNum.setJustifyContent(Justify.Center);
  rungNum.setMargin(Edge.Right, 1);
  parent.insertChild(rungNum, parent.getChildCount());
  return rungNum;
}

function createRungNumContent(
  yoga: Yoga,
  parent: YogaNode,
  rungNumStr: string
): YogaNode {
  const rungNumContent = yoga.Node.create();
  rungNumContent.setWidth(rungNumStr.length);
  rungNumContent.setHeight(1);
  parent.insertChild(rungNumContent, parent.getChildCount());
  return rungNumContent;
}

function renderRungRow(rows: string[], row: StatementWithNodes[]) {
  for (let statement of row) {
    if (statement.type === "CallStatement") {
      if (
        statement.callee === "XIC" ||
        statement.callee === "OTE" ||
        statement.callee === "XIO"
      ) {
        const contact: Contact = statement as Contact;
        renderContact(rows, contact);
      } else {
        renderCall(rows, statement);
      }
    } else if (statement.type === "BranchStatement") {
      statement.branchRow.forEach((br, i) => {
        const brDim = getGlobalDims(br.node);
        // first row
        if (i == 0) {
          replaceStrAt(rows, brDim.top + 1, brDim.left, "┬");
          replaceStrAt(rows, brDim.top + 1, brDim.right, "┬");
        } else {
          // not first row
          replaceStrAt(
            rows,
            brDim.top + 1,
            brDim.left + 1,
            light.horizontal.repeat(brDim.width - 1)
          );
          if (i < statement.branchRow.length - 1) {
            //not first or last row
            replaceStrAt(rows, brDim.top + 1, brDim.left, "├");
            replaceStrAt(rows, brDim.top + 1, brDim.right, "┤");
          }
        }
        if (i < statement.branchRow.length - 1) {
          // not last row
          for (let row = brDim.top + 2; row < brDim.bottom + 1; row += 1) {
            replaceStrAt(rows, row, brDim.left, "│");
            replaceStrAt(rows, row, brDim.right, "│");
          }
        } else {
          // last row
          replaceStrAt(rows, brDim.top + 1, brDim.left, light.bottomLeft);
          replaceStrAt(rows, brDim.top + 1, brDim.right, light.bottomRight);
        }

        renderRungRow(rows, br.row);
      });
    } else {
      throw new Error("not implemented");
    }
  }
}

function renderRung(rows: string[], rung: RungWithNodes) {
  const dim = getGlobalDims(rung.node);
  const rowNum = dim.top + 1;
  replaceStrAt(rows, rowNum, dim.left, "─".repeat(dim.width));
  replaceStrAt(rows, rowNum, dim.right, "┨");
  renderRungNum(rows, rung);
  renderRungRow(rows, rung.statements);
}

function renderRungNum(rows: string[], rung: RungWithNodes) {
  const numDim = getGlobalDims(rung.numNode);
  const numContentDim = getGlobalDims(rung.numContentNode);
  drawRect(rows, numDim, doubleLine);
  replaceStrAt(rows, numDim.top + 1, numDim.right - 1, "╟");
  replaceStrAt(rows, numContentDim.top, numContentDim.left, rung.rungNum);
}
