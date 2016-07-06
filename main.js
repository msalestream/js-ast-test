// Generates Code from AST
var escodegen = require('escodegen')
// Traverses Trees (Validator)
var estraverse = require('estraverse')

//Example Code
var validJs = `
if (scope.step_1_name_input_value_1 === 'internet') {
  console.log('Success!')
}
`

var invalidJs = `
alert('Bad Stuff')
`

//Syntax Trees of Example Code
validAST ={
  "type": "Program",
  "body": [
    {
      "type": "IfStatement",
      "test": {
        "type": "BinaryExpression",
        "operator": "===",
        "left": {
          "type": "MemberExpression",
          "computed": false,
          "object": {
            "type": "Identifier",
            "name": "scope"
          },
          "property": {
            "type": "Identifier",
            "name": "step_1_name_input_value_1"
          }
        },
        "right": {
          "type": "Literal",
          "value": "internet",
          "raw": "'internet'"
        }
      },
      "consequent": {
        "type": "BlockStatement",
        "body": [
          {
            "type": "ExpressionStatement",
            "expression": {
              "type": "CallExpression",
              "callee": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                  "type": "Identifier",
                  "name": "console"
                },
                "property": {
                  "type": "Identifier",
                  "name": "log"
                }
              },
              "arguments": [
                {
                  "type": "Literal",
                  "value": "Success!",
                  "raw": "'Success!'"
                }
              ]
            }
          }
        ]
      },
      "alternate": null
    }
  ],
  "sourceType": "script"
}

var invalidAST = {
  "type": "Program",
  "body": [
    {
      "type": "ExpressionStatement",
      "expression": {
        "type": "CallExpression",
        "callee": {
          "type": "Identifier",
          "name": "alert"
        },
        "arguments": [
          {
            "type": "Literal",
            "value": "Bad Stuff",
            "raw": "'Bad Stuff'"
          }
        ]
      }
    }
  ],
  "sourceType": "script"
}

function isValidCallExpression (node) {
  var allowListedCallExpressions = [
    'console'
  ]
  var calleeName = node.callee.name
  return !calleeName || allowListedCallExpressions.indexOf(calleeName) !== -1
}

// This would be more robust
function isValidAST (ast) {
  var whiteListedNodes = [
    'Program',
    'IfStatement',
    'BinaryExpression',
    'Identifier',
    'BlockStatement',
    'ExpressionStatement',
    'CallExpression',
    'MemberExpression',
    'Identifier',
    'Literal'
  ]

  var status = true
  estraverse.traverse(ast, {
    enter: function (node) {
      if (node.type && whiteListedNodes.indexOf(node.type) === -1) {
        console.error('Has invalid Node')
        status = false
        estraverse.VisitorOption.Break
      } else {
        if(node.type === 'CallExpression' && !isValidCallExpression(node)) {
          console.error('Has invalid call expression')
          status = false
          estraverse.VisitorOption.Break
        }
      }
    }
  })

  return status
}

// For testing injection & scoping
function scopeModifier (ast, scope) {
  if (isValidAST(ast) && scope && typeof scope === 'object') {
    var code = escodegen.generate(ast)
    eval(code)
  } else {
    console.error('Invalid AST')
  }
}

// Mock scope (would be all current inputs)
var scope = {
  "step_1_name_input_value_1": "internet"
}

// Success!
console.log('-------------------')
console.log('Started valid AST!')
scopeModifier(validAST, scope)
console.log('-------------------')
// Failure!
console.log('-------------------')
console.log('Started invalid AST!')
scopeModifier(invalidAST, scope)
console.log('-------------------')
