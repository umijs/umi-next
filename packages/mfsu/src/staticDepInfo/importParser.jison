/* reference https://262.ecma-international.org/12.0/#prod-ImportsList */
/* lexical grammar */
%lex
%%
\s+                   /* skip whitespace */
"//".*                                /* IGNORE line comment  */
"/*"((\*+[^/*])|([^*]))*\**"*/"       /* IGNORE block comment */
"*"                     return 'STAR'
"as"                    return 'AS'
"from"                  return 'FROM'
"import"                return 'IMPORT'
"{"                     return 'LBRACE'
"}"                     return 'RBRACE'
","                     return 'COMMA'
";"                     return 'SEMICOLON'
\"[^\"]*\"|\'[^\']*\'		yytext = yytext.substr(1,yyleng-2); return 'STRING';
[a-zA-Z_]\w*            return 'ID';
/lex

%start Program

%% /* language grammar */

Program
    : ImportStatements { return $1}
    ;

ImportStatements
    : ImportStatement                   { $$ = [ $1 ] }
    | ImportStatements ImportStatement  { $$ = [ ...$1, $2 ] }
    ;

ImportStatement
    : IMPORT ModuleSpecifier            { $$ = { from: $2, imports: []} }
    | IMPORT ImportClause FromClause    { $$ = { from: $3, imports: $2 } }
    ;

ImportClause
    : ImportedDefaultBinding                        { $$ = [ $1 ] }
    | NameSpaceImport                               { $$ = [ $1 ] }
    | NamedImports
    | ImportedDefaultBinding COMMA NameSpaceImport  { $$ = [ $1, $3] }
    | ImportedDefaultBinding COMMA NamedImports     { $$ = [ $1, ...$3]}
    ;

ImportedDefaultBinding
    : ID { $$ = 'default' }
    ;

NamedImports
    : LBRACE ImportsList RBRACE { $$=$2}
    | LBRACE ImportsList COMMA RBRACE { $$=$2 }
    ;

NameSpaceImport
    : STAR AS ID { $$ = '*' }
    ;

ImportsList
    : ImportSpecifier  { $$ = [ $1 ]}
    | ImportsList COMMA ImportSpecifier { $$= [ ...$1, $3 ] }
    ;

ImportSpecifier
    : ID
    | ID AS ID { $$ = $1 }
    ;

FromClause
    : FROM ModuleSpecifier { $$=$2 }
    ;

ModuleSpecifier
    : STRING Semicolon { $$=$1 }
    ;

Semicolon: | SEMICOLON ;
