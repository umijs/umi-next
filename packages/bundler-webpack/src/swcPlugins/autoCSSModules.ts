import { ImportDeclaration, VariableDeclaration } from "@swc/core";
import Visitor from "@swc/core/Visitor";
import { extname } from 'path'


const CSS_EXT_NAMES = ['.css', '.less', '.sass', '.scss', '.stylus', '.styl'];

class AutoCSSModule extends Visitor {

  visitImportDeclaration(expression: ImportDeclaration): ImportDeclaration {
    const { specifiers, source } = expression
    const { value } = source

    if(specifiers.length && CSS_EXT_NAMES.includes(extname(value))) {
      return {
        ...expression,
        source: {
          ...source,
          value: `${value}?modules`,
        }
      }
    }
    return expression
  }

  visitVariableDeclaration(expression: VariableDeclaration): VariableDeclaration {
    const { declarations } = expression;
    console.log('expression', expression.kind)
    if(declarations.length 
      && declarations[0].init 
      && declarations[0].init.type ==='AwaitExpression' 
      && declarations[0].init.argument.type === 'CallExpression' 
      && declarations[0].init.argument.arguments[0].expression.type === 'StringLiteral' 
      && CSS_EXT_NAMES.includes(extname(declarations[0].init.argument.arguments[0].expression.value))) {

      return {
        ...expression,
        kind: 'let',
        declarations: [{
          ...declarations[0],
          init: {
            ...declarations[0].init,
            argument: {
              ...declarations[0].init.argument,
              arguments: [{
                ...declarations[0].init.argument.arguments[0],
               expression: {
                ...declarations[0].init.argument.arguments[0].expression,
                value: `${declarations[0].init.argument.arguments[0].expression.value}?modules`
                }
              }]
            }
          }
        }]
      }
    } 
  

    return expression
  }

}

export default AutoCSSModule