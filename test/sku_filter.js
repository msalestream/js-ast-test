// Generates Code from AST
var escodegen = require('escodegen')
// Traverses Trees (Validator)
var estraverse = require('estraverse')

var sku = {
  class: 'sku.class',
  subclass: 'sku.subclass',
  group: 'sku.group',
  subgroup: 'sku.subgroup'
}

/*
Example Condition
(
  (sku.class === 'internet' && sku.subclass === 'port')
  ||
  sku.class === 'equipment'
  ||
  (sku.group === 'group1' && sku.subclass === '{step_1_input_1}')
)
*/

var FixtureRequest = {
  'form_id': '75', // Used to get Ma Company ID
  'action': 'get_skus',
  'rule': {
    "type": "Program",
    "body": [
      {
        "type": "ExpressionStatement",
        "expression": {
          "type": "LogicalExpression",
          "operator": "||",
          "left": {
            "type": "LogicalExpression",
            "operator": "||",
            "left": {
              "type": "LogicalExpression",
              "operator": "&&",
              "left": {
                "type": "BinaryExpression",
                "operator": "===",
                "left": {
                  "type": "MemberExpression",
                  "computed": false,
                  "object": {
                    "type": "Identifier",
                    "name": "sku"
                  },
                  "property": {
                    "type": "Identifier",
                    "name": "class"
                  }
                },
                "right": {
                  "type": "Literal",
                  "value": "internet",
                  "raw": "'internet'"
                }
              },
              "right": {
                "type": "BinaryExpression",
                "operator": "===",
                "left": {
                  "type": "MemberExpression",
                  "computed": false,
                  "object": {
                    "type": "Identifier",
                    "name": "sku"
                  },
                  "property": {
                    "type": "Identifier",
                    "name": "subclass"
                  }
                },
                "right": {
                  "type": "Literal",
                  "value": "port",
                  "raw": "'port'"
                }
              }
            },
            "right": {
              "type": "BinaryExpression",
              "operator": "===",
              "left": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                  "type": "Identifier",
                  "name": "sku"
                },
                "property": {
                  "type": "Identifier",
                  "name": "class"
                }
              },
              "right": {
                "type": "Literal",
                "value": "equipment",
                "raw": "'equipment'"
              }
            }
          },
          "right": {
            "type": "LogicalExpression",
            "operator": "&&",
            "left": {
              "type": "BinaryExpression",
              "operator": "===",
              "left": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                  "type": "Identifier",
                  "name": "sku"
                },
                "property": {
                  "type": "Identifier",
                  "name": "group"
                }
              },
              "right": {
                "type": "Literal",
                "value": "group1",
                "raw": "'group1'"
              }
            },
            "right": {
              "type": "BinaryExpression",
              "operator": "===",
              "left": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                  "type": "Identifier",
                  "name": "sku"
                },
                "property": {
                  "type": "Identifier",
                  "name": "subclass"
                }
              },
              "right": {
                "type": "Literal",
                "value": "{step_1_input_1}",
                "raw": "'{step_1_input_1}'"
              }
            }
          }
        }
      }
    ],
    "sourceType": "script"
  }
}

function transposeValues (ast, scope) {
  //Unused should be constant
  var delimiter = {
    left: '{{',
    right: '}}'
  }

  function isPlaceHolder (nodeLiteral) {
    var regex = new RegExp('\{(.*?)\}');
    return regex.test(nodeLiteral.value) && regex.test(nodeLiteral.raw)
  }

  function transposeValue (nodeLiteral, scope) {
    var placeHolder = nodeLiteral.value.replace(/\{/g, '').replace(/\}/g, '') // Strip brackets
    if(scope.hasOwnProperty(placeHolder)) {
      nodeLiteral.value = scope[placeHolder]
      nodeLiteral.raw = `'${scope[placeHolder]}'`
    } else {
      throw true // Will be exception class with _toString()
    }
  }

  try {
    // Traverses the supplied AST iterating over every node
    estraverse.traverse(ast, {
      // Hook for when first parsing a node
      enter: function (node) {
        if(node.type === 'Literal' && isPlaceHolder(node)) {
          transposeValue(node, scope)
        }
      }
    })

    return JSON.stringify(ast)
  } catch (e) {
    console.log('Transpose Failed')
    return null
  }
}

var scope = {
  "step_1_input_1": "internet"
}

function sendSkuQueryRequest () {
  console.log(transposeValues(FixtureRequest.rule, scope))
}

sendSkuQueryRequest()
