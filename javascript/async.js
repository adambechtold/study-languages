// ### Show that you can add callbacks to a promise after it resolves
// Eloquent JS, page 186
async function demonstrateAddCallbackAfterPromiseResolved() {
  const myPromise = Promise.resolve(15);
  myPromise.then((v) => {
    console.log("Promise resolved");
    return v;
  });
  setTimeout(() => {
    myPromise.then((v) => {
      console.log("Promise resolved from within timeout");
      return v;
    });
  }, 400);
}

// This one will not call the second then() handler
// and it will throw an error that there was an unhandled promise rejection
// I think this is because the promise is immediately rejected
async function demonstratePromiseReject() {
  const myPromise = Promise.reject(15);
  myPromise.then((_v) => console.log("then() was called"));
  myPromise.catch((_v) => {
    console.log("catch() was called");
    return "nothing";
  });
  myPromise.then((_v) => {
    console.log("second then() was called with", v);
  });
}
// This one will will call the second then() and not throw an unhandled promise rejection error.
// It seems like this validates the idea above.
async function demonstratePromiseRejectAsChain() {
  Promise.reject(15)
    .then((_v) => console.log("then() was called"))
    .catch((v) => {
      console.log("catch() was called", v);
      return "nothing";
    })
    .then((v) => {
      console.log("second then() was called with", v);
    });
}
async function demonstratePromiseConstructorReject() {
  new Promise((_, reject) => reject(new Error("Fail")))
    .then((v) => console.log("handler 1", v))
    .catch((e) => {
      console.log("Caught failure", e);
      return "nothing";
    })
    .then((v) => console.log("handler 2", v));
}
async function demonstrateErrorHandlingWithThen() {
  Promise.reject(15).then(
    () => console.log("succcess"),
    () => console.log("failure"), // this will run
  );
  let result = Promise.reject(15).then(
    () => true,
    () => false,
  );
  console.log("result 1:", await result); // false
  result = Promise.reject(15)
    .then(() => true)
    .catch(() => false);
  console.log("result 2:", await result); // false
}
demonstrateErrorHandlingWithThen();
