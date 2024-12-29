// Strict Mode
function onlyBreaksInStrictMode() {
  "use strict";
  for (counter = 0; counter < 10; counter++) {
    console.log("This will never print");
  }
  // if we didn't use "use strict", it would create a global "counter" variable (or overwrite an existing one)
}
onlyBreaksInStrictMode(); // ReferenceError: counter is not defined

/* Errors caught in use strict that would fail silently otherwise
 *
 * ### Silent Errors become Explicit Errors
 * e.g. try to overwrite a non-write able property
 *
 * const obj = Object.freeze({ name: "Adam" })
 * obj.name = "Brian" // TypeError
 *
 * ### Prevent Undeclared Variables
 * (like we saw above)
 *
 * ### Disallow duplicates
 * function foo(a, a) { // SyntaxError
 *    ...
 * }
 *
 * ### Restrict this
 * The value of "this" remains undefined in function that are not called as part of methods.
 *
 * function foo() {
 *    console.log(this); // undefined
 * }
 *
 * in non-strict mode, there will be a default "this" (e.g. window in browsers and global in node)
 *
 * ### Others
 * - Disallow octal literals (e.g. 0123)
 * - Restrict Delete (cannot use "delete")
 * - Requires secure "eval" usage
 *   - Variables and functions declared in "eval" don't leak into surrounding scope
 *   - eval() cannot introduce new variables into global scope
 * - Disable reserved keywords (cannot overwrite "implements", "interface", "public", etc.)
 * - Prohibit "with" statements
 */
