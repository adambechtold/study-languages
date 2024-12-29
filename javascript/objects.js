class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  [Symbol.iterator]() {
    return new TenthOfVectorIterator(this);
  }
}

console.log(new Vector(1, 2).length);

// This is obviously a very silly example, but it works
class TenthOfVectorIterator {
  constructor(vector) {
    this.x = 0;
    this.y = 0;
    this.vector = vector;
    this.positionIndex = 0;
    this.tenthOfX = vector.x / 10;
    this.tenthOfY = vector.y / 10;
  }

  next() {
    if (this.x >= this.vector.x) return { done: true };

    this.x += this.tenthOfX;
    this.y += this.tenthOfY;

    return {
      value: new Vector(this.x, this.y),
      done: false,
    };
  }
}

const v = new Vector(10, 5);

for (let tenth of v) {
  console.log(tenth);
}

// Using Prototypes
const protoVector = {
  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  },
};
const v2 = Object.create(protoVector);
v2.x = 3;
v2.y = 4;
console.log("v2 length", v2.length);
console.log(v2.prototype);

protoVector[Symbol.iterator] = function () {
  return new TenthOfVectorIterator(this);
};
const v3 = Object.create(protoVector);
v3.x = 10;
v3.y = 5;
for (let tenth of v3) {
  console.log(tenth);
}
// affects previously created objects
for (let tenth of v2) {
  console.log(tenth);
}
console.log(Object.getPrototypeOf(v2) === protoVector);
