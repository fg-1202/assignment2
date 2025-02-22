/* 輸入 Type */
export type BillInput = {
  date: string
  location: string
  tipPercentage: number
  items: BillItem[]
}

type BillItem = SharedBillItem | PersonalBillItem

type CommonBillItem = {
  price: number
  name: string
}

type SharedBillItem = CommonBillItem & {
  isShared: true
}

type PersonalBillItem = CommonBillItem & {
  isShared: false
  person: string
}

/* 輸出 Type */
export type BillOutput = {
  date: string
  location: string
  subTotal: number
  tip: number
  totalAmount: number
  items: PersonItem[]
}

type PersonItem = {
  name: string
  amount: number
}

/* 核心函數 */
export function splitBill(input: BillInput): BillOutput {
  let date = formatDate(input.date)
  let location = input.location
  let subTotal = calculateSubTotal(input.items)
  let tip = calculateTip(subTotal, input.tipPercentage)
  let totalAmount = subTotal + tip
  let items = calculateItems(input.items, input.tipPercentage)
  adjustAmount(totalAmount, items)
  return {
    date,
    location,
    subTotal,
    tip,
    totalAmount,
    items,
  }
}

export function formatDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);// input format: YYYY-MM-DD, e.g. "2024-03-21"
  return `${year}年${month}月${day}日`;// output format: YYYY年M月D日, e.g. "2024年3月21日"
}

function calculateSubTotal(items: BillItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
  // sum up all the price of the items
}

export function calculateTip(subTotal: number, tipPercentage: number): number {
  const tip = subTotal * (tipPercentage / 100);
  return Math.round(tip * 10) / 10; // output round to closest 10 cents, e.g. 12.34 -> 12.3
}

function scanPersons(items: BillItem[]): string[] {
  const persons = new Set<string>();
  items.forEach(item => {
    if (item.isShared) {
      // Do nothing for shared items
    } else {
      persons.add(item.person);
    }
  });
  return Array.from(persons); // scan the persons in the items
}

function calculateItems(items: BillItem[], tipPercentage: number): PersonItem[] {
  const names = scanPersons(items);
  const personsCount = names.length;
  
  return names.map(name => ({
    name,
    amount: calculatePersonAmount({
      items,
      tipPercentage,
      name,
      persons: personsCount,
    }),
  }));
}

function calculatePersonAmount(input: {
  items: BillItem[]
  tipPercentage: number
  name: string
  persons: number
}): number {
  let amount = 0;

  input.items.forEach(item => {
    if (item.isShared) {
      amount += item.price / input.persons;
    } else if (item.person === input.name) {
      amount += item.price;
    }
  });

  const tip = amount * (input.tipPercentage / 100);
  return Math.round((amount + tip + Number.EPSILON) * 10) / 10; // for shared items, split the price evenly, for personal items, do not split the price, return the amount for the person
}

function adjustAmount(totalAmount: number, items: PersonItem[]): void {
  const totalCalculated = items.reduce((sum, item) => sum + item.amount, 0);
  const difference = Math.round((totalAmount - totalCalculated + Number.EPSILON) * 10) / 10;

  console.log("Total Calculated:", totalCalculated);
  console.log("Difference:", difference);

  if (difference !== 0) {
    const adjustment = Math.sign(difference) * 0.1;
    items[0].amount = Math.round((items[0].amount + adjustment + Number.EPSILON) * 10) / 10; // adjust the personal amount to match the total amount
  }
}


