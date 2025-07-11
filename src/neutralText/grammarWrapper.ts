import { parse } from "./grammar";
import { z, ZodType } from "zod";

export type NTRung = NTStatement[];

export type NTCallStatement = {
  type: "CallStatement";
  callee: string;
  arguments: Argument[];
};

export type NTBranchStatement = {
  type: "BranchStatement";
  rungs: NTRung[];
};

// argument is null where there are commas but no arguments, like ABC(,)
export type Argument = string | null;

export type NTStatement = NTCallStatement | NTBranchStatement;

const NTRungSchema: ZodType<NTRung> = z.lazy(() =>
  z.array(
    z.discriminatedUnion("type", [
      z
        .object({
          type: z.literal("CallStatement"),
          callee: z.string(),
          arguments: z.array(z.union([z.string(), z.null()])),
          text: z.string(),
        })
        .strict(),
      z
        .object({
          type: z.literal("BranchStatement"),
          rungs: z.array(NTRungSchema),
          text: z.string(),
        })
        .strict(),
    ])
  )
);

export function parseNeutralText(text: string): NTRung {
  const parsedText = parse(text);
  return NTRungSchema.parse(parsedText);
}
