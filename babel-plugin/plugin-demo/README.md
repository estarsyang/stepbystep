## babel插件
本文主要有以下几个内容
- 为什么要实现一个插件
- 实现插件所需要的知识
- 如何去实现
- 业务中有可能需要用到的

### 为什么要实现一个插件
emmmm，想学习的深入些......

### 实现插件所需要的知识
- 一点点的`AST`知识
  1. [AST基本讲解及参数](http://www.goyth.com/2018/12/23/AST/#%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A6%81%E4%BA%86%E8%A7%A3AST)
  2. [AST的在线编译工具](https://astexplorer.net/)
- 一点点的编译原理知识以及babel的编译过程
  1. 
  2. [babel及AST文档](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md)
- 一点点的英文阅读能力[@babel/types](https://www.babeljs.cn/docs/babel-types)。开发的过程中需要用到babel的类型，需要了解它的类型接使用方法


### 如何去实现
这里简单实现一个可选操作链的babel
- 新建一个空文件夹
- npm install --save-dev @babel/core @babel/cli
- .gitignore  .babelrc.json
    - .gitignore node_modules
    - .babelrc.json
      ```json
        {
        "plugins": [
              "./plugins/optional-chaining-plugin" // 我们开发插件位置
          ]
        }
      ```
    - 
- src/index.js 
  ```js
    // 要变异的内容
    function demo(foo) {
      return foo?.bar;
    }
  ```
- ok，重头戏来了，开始去编写转换规则 plugins/optional-chaining-plugin

### 编写转换规则
1. 了解babel的作用
  - babel主要是将高版本的js或者是非js或json的文件转换成js，方便浏览器识别并运行
2. babel的转换过程
  - 转换过程
    1. 解析(parse)
      - 接收代码并转换成AST结构
        - 两步
          1. 词法分析
            - 词法分析阶段把字符串形式的代码转换为 **令牌（tokens）** 流  
              你可以把令牌看作是一个扁平的语法片段数组：
              ```js
              n * n
              ```
              ```js
                [
                  { type: { ... }, value: "n", start: 0, end: 1, loc: { ... } },
                  { type: { ... }, value: "*", start: 2, end: 3, loc: { ... } },
                  { type: { ... }, value: "n", start: 4, end: 5, loc: { ... } },
                  ...
                ]
              ```
              每一个 `type` 有一组属性来描述该令牌：
              ```js
                {
                  type: {
                    label: 'name',
                    keyword: undefined,
                    beforeExpr: false,
                    startsExpr: true,
                    rightAssociative: false,
                    isLoop: false,
                    isAssign: false,
                    prefix: false,
                    postfix: false,
                    binop: null,
                    updateContext: null
                  },
                  ...
                }
              ```
              和 AST 节点一样它们也有 `start`，`end`，`loc` 属性。.
          2. 语法分析
            - 语法分析阶段会把一个令牌流转换成 AST 的形式。 这个阶段会使用令牌中的信息把它们转换成一个 AST 的表述结构，这样更易于后续的操作。


    2. 转换(transform)
      - 对生成的AST结构进行添加，更新及移除操作
    3. 生成(generator)
      - 把转换后的AST转换成字符串形式的代码，同时还会创建[源码映射(source)](https://www.html5rocks.com/en/tutorials/developertools/sourcemaps/)
3. 要编译的内容转成浏览器兼容的是什么样的 [babel在线转换](https://www.babeljs.cn/)
  - 原写法
  ```js
    function demo(foo) {
      return foo?.bar;
    }
  ```
  - 浏览器兼容
  ```js
    function demo(foo){
      return foo == null ? void 0 : foo.bar
    }
  ```
4. 查看新旧代码的AST结构
  - 访问[https://astexplorer.net/](https://astexplorer.net/)
  - 开始编写代码
      babel plugin 组件模板
      ```js
        module.exports = function (babel) {
          const {
            types: t,
            template
          } = babel
          return {
            name: 'my-plugin',
            visitor: {
              // expression 表达式
            }
          }
        }
      ```
  - 由于我们这里是处理可选操作符，所以我们去查阅[文档 @babel/types](https://www.babeljs.cn/docs/babel-types),得出可选操作是`optionalMemberExpression`。
  ```js
    module.exports = function (babel) {
      const {
        types: t,
        template
      } = babel
      return {
        name: 'my-plugin',
        visitor: {
          // expression 表达式
          optionalMemberExpression(path) {
            const {object, property} = path.node

            // path为当前遍历的节点，这个节点为命中可选操作符的内容，即 foo?.bar ，我们需要将这个节点替换
            path.replaceWith(
              // 这里我们就要开始写替换后的内容了，把 foo == null ? void 0 : foo.bar 拿过来比对
              // 每一个表达式都要创建，如何去创建。babel自带的types已经为我们封装了所有表达式，直接调用即可
              // 首先是三元运算符  xxx ? xxx : xxx,照旧去文档寻找三元运算符的表达式 https://www.babeljs.cn/docs/babel-types#conditionalexpression  t.conditionalExpression(test, consequent, alternate)
              // 三个入参， test consequent alternate 。不知道是啥咋办，没关系。把这段代码 foo == null ? void 0 : foo.bar 放入 ast 去转译。就能在右侧的asttree下看到你想要的东西，包括 test consequent alternate。
              t.ConditionalExpression( // 构造三元运算符

                // 构造三元运算符问好左边内容
                t.BinaryExpression( // https://www.babeljs.cn/docs/babel-types#binaryexpression 
                  '==',
                  t.identifier(object.name), // https://www.babeljs.cn/docs/babel-types#identifier
                  t.nullLiteral(), // https://www.babeljs.cn/docs/babel-types#nullliteral
                ),

                //  三元运算符冒号左边内容
                t.UnaryExpression( // https://www.babeljs.cn/docs/babel-types#unaryexpression
                  "void",
                  t.numericLiteral(0) // https://www.babeljs.cn/docs/babel-types#numericliteral
                ),
                // 三元运算符冒号右边内容
                t.MemberExpression( // // https://www.babeljs.cn/docs/babel-types#memberexpression 
                  t.identifier(object.name),
                  t.identifier(property.name),
                )
              )
            )
          }
        }
      }
    }
  ```
  `t.conditionalExpression` 的 `ast` 效果   
  ![ast tree](https://raw.githubusercontent.com/estarsyang/ImgRep/main/babel/conditionalExpression-ast.png)   
  优化，其实我们可以用`babel`的`template`来优化下写法  [@babel/template](https://www.babeljs.cn/docs/babel-template)
  ```js
    t.UnaryExpression(
      "void",
      t.numericLiteral(0)
    ),
    // 改变为
    template.expression('void 0')(),
  ```
5. 搞定，然后执行 `yarn start` `"start": "babel src/ -d dist/"`。编译后代码就出现在dist中了


### 业务中用到的场景
暂时还没发现.....期待各位大佬补充
### 所需插件的知识进阶
- 访问者模式
- 更深的编译原理理解
- 数据结构与算法

### 文章参考
- [Babel插件开发入门指南](https://juejin.cn/post/6844903616080281614)
- [Babel for ES6? And Beyond!](https://h5jun.com/post/babel-for-es6-and-beyond.html)
- [Babel 插件手册](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md#toc-asts)
- [手把手带你入门 AST 抽象语法树](https://juejin.cn/post/6844904035271573511#heading-9)
- [为什么要了解AST](http://www.goyth.com/2018/12/23/AST/#%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A6%81%E4%BA%86%E8%A7%A3AST)
- [Babylon-AST初探-代码更新&删除(Update & Remove)](https://juejin.cn/post/6844903614880677896)
