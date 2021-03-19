// foo?.bar?
// foo == null ? void 0 : foo.bar
module.exports = function (babel) {
    const {
        types: t,
        template
    } = babel
    return {
        name: 'my-plugin',
        visitor: {
            OptionalMemberExpression(path, state) {
                path.replaceWith(
                    // t.conditionalExpression(test, consequent, alternate)
                    t.ConditionalExpression(
                        // t.binaryExpression(operator, left, right)
                        t.BinaryExpression(
                            "==",
                            // t.identifier(name)
                            t.identifier(path.node.object.name),
                            t.nullLiteral()
                        ),
                        // t.unaryExpression(operator, argument, prefix)
                        t.UnaryExpression(
                            "void",
                            t.NumericLiteral(0)
                        ),
                        // t.memberExpression(object, property, computed, optional)
                        t.MemberExpression(
                            t.identifier(path.node.object.name),
                            t.identifier(path.node.property.name),
                        )
                    )
                )
            }
        }
    }

}