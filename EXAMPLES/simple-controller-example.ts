// Simple Class Example
class Calculator {
  // Property (variable that belongs to the class)
  private name: string;
  
  // Constructor (runs when we create a new calculator)
  constructor(name: string) {
    this.name = name;
    console.log(`Calculator ${name} is ready!`);
  }
  
  // Method (function that belongs to the class)
  public add(a: number, b: number): number {
    console.log(`${this.name} is adding ${a} + ${b}`);
    return a + b;
  }
  
  public multiply(a: number, b: number): number {
    console.log(`${this.name} is multiplying ${a} * ${b}`);
    return a * b;
  }
}

// How to use it:
const myCalculator = new Calculator("MathBot");  // Creates new instance
const result1 = myCalculator.add(5, 3);         // Uses the method
const result2 = myCalculator.multiply(4, 6);    // Uses another method

console.log(result1); // 8
console.log(result2); // 24

// You can create multiple calculators
const anotherCalculator = new Calculator("SuperCalc");
const result3 = anotherCalculator.add(10, 20); // 30
