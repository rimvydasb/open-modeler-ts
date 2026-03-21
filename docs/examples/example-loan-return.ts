/**
 * @projectName Example Loan Return Application
 *
 * @description:
 * Configure the INPUT_VARIABLES below with your loan details.
 * The application generates a loan schedule which can be visualized
 * using the chart function (to plot remaining loan balance) or the
 * table function (to display payment lines).
 */

/**
 * @displayName Payment Line
 * @visible none
 */
interface PaymentLine {
    paymentDate: Date;
    amount: number;
    principalPaid: number;
    interestPaid: number;
    remainingBalance: number;
}

/**
 * @displayName Input Variables
 * @nodeType list
 */
const INPUT_VARIABLES = {
    loanAmount: 100000,
    annualInterestRate: 5.0, // in percentage
    termMonths: 360, // 30 years
    startDate: new Date('2026-04-01'),
};

/**
 * @nodeType function
 * @displayName Calculate Monthly Payment
 *
 * Calculates the fixed monthly payment for a loan based on the principal, annual interest rate, and loan term in months.
 *
 * @param principal
 * @param annualRate
 * @param months
 * @return monthlyPayment
 */
function calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) return principal / months;

    return (principal * (monthlyRate * Math.pow(1 + monthlyRate, months))) / (Math.pow(1 + monthlyRate, months) - 1);
}

/**
 * @nodeType function
 *
 * @param monthlyPayment
 * @param annualInterestRate
 * @param termMonths
 * @param startDate
 */
function generateLoanSchedule(
    loanAmount: number,
    monthlyPayment: number,
    annualInterestRate: number,
    termMonths: number,
    startDate: Date,
): PaymentLine[] {
    const monthlyRate = annualInterestRate / 100 / 12;

    let currentBalance = loanAmount;
    let currentDate = new Date(startDate);
    const schedule: PaymentLine[] = [];

    for (let month = 1; month <= termMonths; month++) {
        const interestPaid = currentBalance * monthlyRate;
        let principalPaid = monthlyPayment - interestPaid;

        // Handle last month rounding
        if (month === termMonths) {
            principalPaid = currentBalance;
        }

        currentBalance -= principalPaid;

        schedule.push({
            paymentDate: new Date(currentDate),
            amount: principalPaid + interestPaid,
            principalPaid,
            interestPaid,
            remainingBalance: Math.max(0, currentBalance),
        });

        // Advance to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return schedule;
}

/**
 * @nodeType chart { "type": "line", "xAxis": "paymentDate", "yAxis": "remainingBalance" }
 * @param schedule
 */
function renderLoanBalanceChart(schedule: PaymentLine[]): void {
    // chart_hook(schedule);
}

/**
 * @nodeType table
 * @param schedule
 */
function renderLoanScheduleTable(schedule: PaymentLine[]): void {
    // table_hook(schedule);
}

/**
 * @nodeType: flow
 */
export function main() {
    const {loanAmount, annualInterestRate, termMonths, startDate} = INPUT_VARIABLES;
    const monthlyPayment = calculateMonthlyPayment(loanAmount, annualInterestRate, termMonths);
    const schedule = generateLoanSchedule(loanAmount, monthlyPayment, annualInterestRate, termMonths, startDate);
    renderLoanBalanceChart(schedule);
    renderLoanScheduleTable(schedule);
}
