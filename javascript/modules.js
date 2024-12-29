const x = 1;
function evalAndReturnX(code) {
  eval(code);
  return x;
}
console.log(evalAndReturnX("var x = 2")); // 2
console.log(x); // 1

function evalAsFunctionAndReturnX(args, functionBody) {
  Function(...args, functionBody)();
  return x;
}
console.log(evalAsFunctionAndReturnX("", "x = 2")); // 1
console.log(x); // 1

// with args
const add = Function("a", "b", "return a + b");
console.log(add(1, 2));
