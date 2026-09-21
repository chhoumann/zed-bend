; Later captures win. Keep the generic identifier rule first.

(identifier) @variable

(comment) @comment

(string) @string
(char) @string
(escape_sequence) @string.escape

(nat) @number
(integer) @number
(float) @number
(quantity) @constant

(builtin_type) @type.builtin

(hole) @variable.special

(unsafe) @keyword

[
  "import"
  "as"
  "def"
  "type"
  "law"
  "is"
  "match"
  "case"
  "do"
  "return"
  "for"
  "exs"
  "where"
] @keyword

[
  "+"
  "-"
  "~"
  "!"
  "="
  "<-"
  "=>"
  "->"
  "=="
  "!="
  "<="
  ">="
  "++"
  "<>"
  "<&>"
  "&"
  "|"
  "||"
  "&&"
  "*"
  "/"
  "%"
  ".|."
  ".^."
  ".&."
  "@"
  "\\"
  "?"
] @operator

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
  "<"
  ">"
] @punctuation.bracket

[
  ","
  ":"
  ";"
] @punctuation.delimiter

(import_statement
  "Base" @type)

(import_path) @string

((identifier) @type
  (#match? @type "^[A-Z]"))

(function_definition
  name: (identifier) @function)

(type_definition
  name: (identifier) @type)

(law_definition
  name: (identifier) @function)

(constructor_declaration
  name: (identifier) @constructor)

(constructor
  name: (identifier) @constructor)

(call
  function: (identifier) @function)

(type_application
  name: (identifier) @type)

(parameter
  name: (identifier) @variable.parameter)

(clause
  name: (identifier) @variable.parameter)

(do_block
  monad: (identifier) @type)
