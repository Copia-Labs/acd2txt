// a rung is a series of statements
Rung
  = __ statements:Statement* __ ";"? __ { return statements }

// a statement is either a branch or a call
Statement
  = __ branch:BranchStatement __ { return branch }
  / __ call:CallStatement __ { return call }

// a branch is a series of rungs (recursive with the root level rule)
BranchStatement
  = "[" rungs:Rungs "]" { return {type: 'BranchStatement', rungs: rungs, text: text() } }

Rungs
  = head:Rung tail:AnotherRung* { return [head, ...tail] }

AnotherRung = "," rung:Rung { return rung }

// a call is a function name and a list of arguments
CallStatement
  = callee:Identifier args:CallArguments { return {type: 'CallStatement', callee: callee, arguments: args, text: text() } }

CallArguments
  = "(" __ ")" {return []}
  / "(" __ args:ArgumentList __ ")" { return args }

ArgumentList
  = args:(Argument/Empty)|..,","| {return args}

// We will render expression text verbatim, but we still need to parse it to tell where it ends
Argument = (QuotedString/ParentheticalExpression/BracketExpression/AnythingButSpecialCharacters)+ { return text() }

ParentheticalExpression = "(" ArgumentList ")" { return text()}
BracketExpression  = "[" ArgumentList "]" { return text()}

TextExpression = SingleQuotedText/DoubleQuotedText { return text() }
DoubleQuotedText = '"' (!'"' .)* '"' { return text() }
SingleQuotedText = "'" (!"'" .)* "'" { return text() }

Empty = "" & CloseCharacters {return null}

AnythingButSpecialCharacters = (!SpecialCharacters .)+
OpenCharacters = [\(\[]
CloseCharacters = [\]\),]
SpecialCharacters = OpenCharacters/CloseCharacters
QuotedString
  = SingleQuotedString/DoubleQuotedString
SingleQuotedString = "'" (!"'" .)* "'" { return text() }
DoubleQuotedString = '"' (!'"' .)* '"' { return text() }

Identifier
  = $(IdentifierStart IdentifierPart*)

IdentifierStart
  = [_a-zA-Z%@\\:]

IdentifierPart
  = ((IdentifierStart)
  / [0-9])

// optional whitespace
__ = ([ \r\n\t])*