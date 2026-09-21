/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PREC = {
  lambda: 1,
  arrow: 2,
  pair: 3,
  or: 4,
  and: 5,
  cmp: 6,
  append: 7,
  meet: 8,
  add: 9,
  mul: 10,
  unary: 11,
  call: 12,
  index: 13,
};

module.exports = grammar({
  name: "bend",

  extras: ($) => [/\s/, $.comment],

  word: ($) => $.identifier,

  conflicts: ($) => [
    [$.assignment, $._expression],
    [$.bind_statement, $._expression],
    [$.type_application, $.binary_expression],
    [$.constructor, $._primary],
    [$.parameter, $._primary],
    [$.parameter, $.unary_expression],
    [$.assignment, $._primary],
    [$._expression, $.index_write],
    [$.arrow, $.forall],
    [$.arrow, $.exists],
    [$.block],
    [$.do_block],
    [$.match],
    [$.case],
    [$._primary, $.rewrite],
  ],

  rules: {
    source_file: ($) => repeat($._declaration),

    _declaration: ($) =>
      choice(
        $.import_statement,
        $.function_definition,
        $.type_definition,
        $.law_definition,
      ),

    import_statement: ($) =>
      choice(
        seq("import", "Base"),
        seq(
          "import",
          field("path", $.import_path),
          "as",
          field("alias", $.identifier),
        ),
      ),

    import_path: (_) => /[.\/A-Za-z0-9_-]+\.bend/,

    function_definition: ($) =>
      seq(
        optional($.unsafe),
        "def",
        field("name", $.identifier),
        "(",
        optional(field("parameters", $.parameter_list)),
        ")",
        optional(seq("->", field("return_type", $._expression))),
        ":",
        field("body", $.block),
      ),

    unsafe: (_) => "@unsafe",

    type_definition: ($) =>
      seq(
        "type",
        field("name", $.identifier),
        optional(seq("<", optional(field("parameters", $.parameter_list)), ">")),
        "is",
        field("kind", $._expression),
        ":",
        repeat(field("constructor", $.constructor_declaration)),
      ),

    constructor_declaration: ($) =>
      seq(
        field("name", $.identifier),
        "{",
        optional(field("fields", $.parameter_list)),
        "}",
      ),

    law_definition: ($) =>
      seq(
        "law",
        field("name", $.identifier),
        ":",
        repeat($.clause),
        field("body", $.block),
      ),

    clause: ($) =>
      seq(
        choice("for", "exs"),
        optional(choice("+", "-", "~")),
        field("name", $.identifier),
        ":",
        field("type", $._expression),
        optional(seq("where", $._expression)),
      ),

    parameter_list: ($) => commaSep1($.parameter),

    parameter: ($) =>
      prec(
        PREC.unary + 1,
        seq(
          optional(field("quant", choice("+", "-", "~"))),
          field("name", $.identifier),
          optional(seq(":", field("type", $._expression))),
        ),
      ),

    block: ($) => repeat1($._statement),

    _statement: ($) =>
      choice(
        $.match,
        $.do_block,
        $.assignment,
        $.index_write,
        $.bind_statement,
        $.return_statement,
        $.foreign_import,
        $._expression,
      ),

    foreign_import: ($) => seq("import", $.string),

    match: ($) =>
      seq(
        "match",
        field("scrutinee", sep1($._expression, optional(","))),
        ":",
        repeat(field("case", $.case)),
      ),

    case: ($) =>
      seq(
        "case",
        field("pattern", sep1($._expression, optional(","))),
        ":",
        optional(field("body", $.block)),
      ),

    do_block: ($) =>
      seq(
        "do",
        field("monad", $.identifier),
        "<",
        optional(commaSep($._expression)),
        ">",
        ":",
        field("body", $.block),
      ),

    assignment: ($) =>
      seq(
        field(
          "left",
          choice(
            $.tuple,
            $.constructor,
            seq(
              optional(field("quant", choice("+", "-", "~"))),
              field("name", $.identifier),
              optional(seq(":", field("type", $._expression))),
            ),
          ),
        ),
        "=",
        field("value", $._expression),
        optional(";"),
      ),

    bind_statement: ($) =>
      seq(
        optional(seq(field("name", $.identifier), ":", field("type", $._expression))),
        "<-",
        field("value", $._expression),
        optional(";"),
      ),

    return_statement: ($) => seq("return", $._expression),

    _expression: ($) =>
      choice(
        $.lambda,
        $.arrow,
        $.binary_expression,
        $.unary_expression,
        $.call,
        $.index_expression,
        $.type_application,
        $._primary,
      ),

    _primary: ($) =>
      choice(
        $.parenthesized,
        $.tuple,
        $.list,
        $.array,
        $.annotation,
        $.equality,
        $.inequality,
        $.refl,
        $.constructor,
        $.forall,
        $.exists,
        $.rewrite,
        $.match_term,
        $.hole,
        $.string,
        $.char,
        $.nat,
        $.float,
        $.integer,
        $.quantity,
        $.builtin_type,
        $.identifier,
      ),

    parenthesized: ($) => seq("(", $._expression, optional(seq(":", $._expression)), ")"),

    tuple: ($) => seq("(", $._expression, ",", commaSep1($._expression), ")"),

    list: ($) => seq("[", optional(commaSep($._expression)), "]"),

    array: ($) =>
      seq(
        "[",
        field("fill", $._expression),
        ":",
        field("type", $._expression),
        choice("*", "^"),
        field("size", $._expression),
        "]",
      ),

    annotation: ($) =>
      seq("{", field("value", $._expression), ":", field("type", $._expression), "}"),

    equality: ($) =>
      seq(
        "{",
        field("left", $._expression),
        "==",
        field("right", $._expression),
        ":",
        field("type", $._expression),
        "}",
      ),

    inequality: ($) =>
      seq(
        "{",
        field("left", $._expression),
        "!=",
        field("right", $._expression),
        ":",
        field("type", $._expression),
        "}",
      ),

    refl: (_) => seq("{", "==", "}"),

    constructor: ($) =>
      prec(
        PREC.call,
        seq(
          field("name", $.identifier),
          token.immediate("{"),
          optional(commaSep($._expression)),
          "}",
        ),
      ),

    call: ($) =>
      prec(
        PREC.call,
        seq(
          field("function", $._expression),
          optional(token.immediate("!")),
          token.immediate("("),
          optional(field("arguments", commaSep($._expression))),
          ")",
        ),
      ),

    type_application: ($) =>
      prec(
        PREC.call,
        seq(
          field("name", $.identifier),
          token.immediate("<"),
          commaSep1($._expression),
          ">",
        ),
      ),

    index_expression: ($) =>
      prec.left(
        PREC.index,
        seq(
          field("array", $._expression),
          "[",
          field("index", $._expression),
          "]",
        ),
      ),

    index_write: ($) =>
      prec(
        PREC.index + 1,
        seq(
          field("array", $.index_expression),
          "<-",
          field("value", $._expression),
        ),
      ),

    lambda: ($) =>
      prec.right(
        PREC.lambda,
        seq(field("parameter", $._expression), "=>", field("body", $._expression)),
      ),

    arrow: ($) =>
      prec.right(
        PREC.arrow,
        seq(field("from", $._expression), "->", field("to", $._expression)),
      ),

    forall: ($) =>
      prec.right(
        PREC.arrow + 1,
        seq(
          "@",
          optional(choice("+", "-")),
          field("name", $.identifier),
          ":",
          field("type", $._expression),
          "->",
          field("body", $._expression),
        ),
      ),

    exists: ($) =>
      prec.right(
        PREC.arrow + 1,
        seq(
          "&",
          field("name", $.identifier),
          ":",
          field("type", $._expression),
          "->",
          field("body", $._expression),
        ),
      ),

    rewrite: ($) =>
      seq(
        "%",
        optional(seq(field("name", $.identifier), "@")),
        field("equation", $._expression),
        ":",
        field("motive", $._expression),
      ),

    match_term: ($) =>
      seq(
        "\\",
        "{",
        repeat(seq($.identifier, ":", $._expression, optional(";"))),
        optional($._expression),
        "}",
      ),

    unary_expression: ($) =>
      prec(PREC.unary, seq(choice("+", "-"), $._expression)),

    binary_expression: ($) => {
      /** @type {[number, "left" | "right", string[]][]} */
      const table = [
        [PREC.pair, "right", ["&", "|"]],
        [PREC.or, "left", ["||"]],
        [PREC.and, "left", ["&&"]],
        [PREC.cmp, "left", ["<=", ">="]],
        [PREC.append, "left", ["++", "<>"]],
        [PREC.meet, "left", ["<&>"]],
        [PREC.add, "left", ["+", "-"]],
        [PREC.mul, "left", ["*", "/", "%", ".|.", ".^.", ".&."]],
      ];
      return choice(
        ...table.map(([precLevel, assoc, ops]) =>
          (assoc === "right" ? prec.right : prec.left)(
            precLevel,
            seq(
              field("left", $._expression),
              field("operator", choice(...ops)),
              field("right", $._expression),
            ),
          ),
        ),
      );
    },

    hole: ($) => seq("?", $.identifier),

    builtin_type: (_) => choice("Type", "Data", "Kind", "Quant"),

    quantity: (_) => choice("&0", "&1", "&2"),

    identifier: (_) => /[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*/,

    nat: (_) => /\d+n/,

    float: (_) => /\d+\.\d+([eE][+-]?\d+)?/,

    integer: (_) => /\d+/,

    string: ($) =>
      seq(
        '"',
        repeat(choice($.escape_sequence, /[^"\\]+/)),
        '"',
      ),

    char: ($) =>
      seq(
        "'",
        choice($.escape_sequence, /[^'\\]/),
        "'",
      ),

    escape_sequence: (_) =>
      token.immediate(/\\(u\{[0-9a-fA-F]+\}|[ntr0\\'"])/),

    comment: (_) => token(seq("#", /.*/)),
  },
});

/**
 * @param {RuleOrLiteral} rule
 */
function commaSep(rule) {
  return optional(commaSep1(rule));
}

/**
 * @param {RuleOrLiteral} rule
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)), optional(","));
}

/**
 * @param {RuleOrLiteral} rule
 * @param {RuleOrLiteral} sep
 */
function sep1(rule, sep) {
  return seq(rule, repeat(seq(sep, rule)));
}
