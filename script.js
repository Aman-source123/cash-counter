/* =====================================================
   CASH COUNTER PRO
   ONLY HTML + CSS + JAVASCRIPT
===================================================== */


/* ================= DENOMINATIONS ================= */

const notes = [500, 200, 100, 50, 20, 10];
const coins = [10, 5, 2, 1];


/* ================= STORAGE ================= */

let cashCounts =
    JSON.parse(localStorage.getItem("cashCounts")) || {};

let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];

let openingCash =
    Number(localStorage.getItem("openingCash")) || 0;

let actualCash =
    Number(localStorage.getItem("actualCash")) || 0;

let cashFlowResetAt =
    Number(localStorage.getItem("cashFlowResetAt")) || 0;


/* ================= HELPERS ================= */

function formatMoney(value) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
    }).format(Number(value) || 0);

}


function setText(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}


/* ================= DATE ================= */

function updateDate() {

    const dateElement =
        document.getElementById("currentDate");

    if (!dateElement) return;

    const now = new Date();

    dateElement.textContent =
        now.toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
}


/* ================= CASH TABLE ================= */

function createCashTables() {

    const cashTable =
        document.getElementById("cashTable");

    if (!cashTable) return;

    cashTable.innerHTML = "";

    notes.forEach(value => {

        cashTable.appendChild(
            createCashRow(value, "note")
        );

    });

    coins.forEach(value => {

        cashTable.appendChild(
            createCashRow(value, "coin")
        );

    });

}


/* ================= CASH ROW ================= */

function createCashRow(value, type) {

    const key = `${type}_${value}`;

    const quantity =
        Number(cashCounts[key]) || 0;

    const amount =
        value * quantity;

    const row =
        document.createElement("tr");

    row.innerHTML = `

        <td>
            <span class="cash-type ${type}">
                ${type === "note" ? "💵 Note" : "🪙 Coin"}
            </span>
        </td>

        <td>
            <strong>₹${value}</strong>
        </td>

        <td>

            <input
                type="number"
                min="0"
                value="${quantity}"
                class="quantity-input"
                data-type="${type}"
                data-value="${value}"
            >

        </td>

        <td>

            <div
                class="amount-box"
                data-amount-key="${key}"
            >
                ${formatMoney(amount)}
            </div>

        </td>
    `;

    return row;
}


/* ================= CALCULATE CASH ================= */

function calculateCash() {

    let notesTotal = 0;
    let coinsTotal = 0;
    let totalItems = 0;


    /* NOTES */

    notes.forEach(value => {

        const key = `note_${value}`;

        const quantity =
            Number(cashCounts[key]) || 0;

        const amount =
            value * quantity;

        notesTotal += amount;

        totalItems += quantity;

        document
            .querySelectorAll(
                `[data-amount-key="${key}"]`
            )
            .forEach(element => {

                element.textContent =
                    formatMoney(amount);

            });

    });


    /* COINS */

    coins.forEach(value => {

        const key = `coin_${value}`;

        const quantity =
            Number(cashCounts[key]) || 0;

        const amount =
            value * quantity;

        coinsTotal += amount;

        totalItems += quantity;

        document
            .querySelectorAll(
                `[data-amount-key="${key}"]`
            )
            .forEach(element => {

                element.textContent =
                    formatMoney(amount);

            });

    });


    const total =
        notesTotal + coinsTotal;


    /* DASHBOARD */

    setText(
        "dashboardTotal",
        formatMoney(total)
    );

    setText(
        "dashboardNotes",
        formatMoney(notesTotal)
    );

    setText(
        "dashboardCoins",
        formatMoney(coinsTotal)
    );

    setText(
        "dashboardItems",
        totalItems
    );


    /* SUMMARY */

    setText(
        "summaryNotes",
        formatMoney(notesTotal)
    );

    setText(
        "summaryCoins",
        formatMoney(coinsTotal)
    );

    setText(
        "summaryTotal",
        formatMoney(total)
    );

    setText(
        "grandItems",
        totalItems
    );


    /* COUNTER */

    setText(
        "grandTotal",
        formatMoney(total)
    );


    /* SAVE */

    localStorage.setItem(
        "cashCounts",
        JSON.stringify(cashCounts)
    );


    updateActualCash();
    updateExpectedCash();
    updateReports();

}


/* ================= ACTUAL CASH ================= */

function getActualCash() {

    let total = 0;

    notes.forEach(value => {

        const key = `note_${value}`;

        total +=
            value *
            (Number(cashCounts[key]) || 0);

    });


    coins.forEach(value => {

        const key = `coin_${value}`;

        total +=
            value *
            (Number(cashCounts[key]) || 0);

    });


    return total;
}


/* ================= TRANSACTION TOTALS ================= */

function getCashIn() {

    return transactions
        .filter(transaction => {

            return (
                transaction.type === "in" &&
                transaction.timestamp > cashFlowResetAt
            );

        })
        .reduce(
            (sum, transaction) =>
                sum + Number(transaction.amount),
            0
        );
}


function getCashOut() {

    return transactions
        .filter(transaction => {

            return (
                transaction.type === "out" &&
                transaction.timestamp > cashFlowResetAt
            );

        })
        .reduce(
            (sum, transaction) =>
                sum + Number(transaction.amount),
            0
        );
}


/* ================= EXPECTED CASH ================= */

function getExpectedCash() {

    return (
        openingCash +
        getCashIn() -
        getCashOut()
    );

}


/* ================= UPDATE ACTUAL ================= */

function updateActualCash() {

    const total =
        getActualCash();

    setText(
        "statusActual",
        formatMoney(total)
    );

    setText(
        "counterDifference",
        formatMoney(
            total - getExpectedCash()
        )
    );

    setText(
        "statusDifference",
        formatMoney(
            total - getExpectedCash()
        )
    );

    setText(
        "reportActual",
        formatMoney(total)
    );

}


/* ================= UPDATE EXPECTED ================= */

function updateExpectedCash() {

    const cashIn =
        getCashIn();

    const cashOut =
        getCashOut();

    const expected =
        getExpectedCash();


    setText(
        "statusOpening",
        formatMoney(openingCash)
    );

    setText(
        "statusIn",
        formatMoney(cashIn)
    );

    setText(
        "statusOut",
        formatMoney(cashOut)
    );

    setText(
        "statusExpected",
        formatMoney(expected)
    );

    setText(
        "counterExpected",
        formatMoney(expected)
    );

}


/* ================= ADD TRANSACTION ================= */

function addTransaction() {

    const type =
        document.getElementById(
            "transactionType"
        ).value;

    const amount =
        Number(
            document.getElementById(
                "transactionAmount"
            ).value
        );

    const description =
        document.getElementById(
            "transactionDescription"
        ).value.trim();


    if (!amount || amount <= 0) {

        alert("Please enter a valid amount.");

        return;
    }


    const transaction = {

        id: Date.now(),

        type: type,

        amount: amount,

        description:
            description ||
            (type === "in"
                ? "Cash In"
                : "Cash Out"),

        timestamp: Date.now()

    };


    transactions.unshift(
        transaction
    );


    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );


    document.getElementById(
        "transactionAmount"
    ).value = "";

    document.getElementById(
        "transactionDescription"
    ).value = "";


    updateExpectedCash();

    updateActualCash();

    renderTransactions();

    updateReports();

    alert("Transaction added successfully.");

}


/* ================= TRANSACTIONS ================= */

function renderTransactions() {

    const list =
        document.getElementById(
            "transactionList"
        );

    if (!list) return;


    const search =
        document.getElementById(
            "searchTransaction"
        ).value.toLowerCase();


    const filter =
        document.getElementById(
            "transactionFilter"
        ).value;


    const filtered =
        transactions.filter(transaction => {

            const matchesSearch =
                transaction.description
                    .toLowerCase()
                    .includes(search);

            const matchesFilter =
                filter === "all" ||
                transaction.type === filter;

            return (
                matchesSearch &&
                matchesFilter
            );

        });


    list.innerHTML = "";


    if (filtered.length === 0) {

        list.innerHTML = `
            <div class="empty-state">
                No transactions found.
            </div>
        `;

        return;
    }


    filtered.forEach(transaction => {

        const item =
            document.createElement("div");

        item.className =
            "transaction-item";


        const date =
            new Date(
                transaction.timestamp
            ).toLocaleString("en-IN");


        item.innerHTML = `

            <div class="transaction-left">

                <div class="transaction-icon ${transaction.type}">
                    ${transaction.type === "in"
                        ? "⬆️"
                        : "⬇️"}
                </div>

                <div class="transaction-info">

                    <h4>
                        ${escapeHTML(
                            transaction.description
                        )}
                    </h4>

                    <p>${date}</p>

                </div>

            </div>


            <div class="transaction-right">

                <strong class="transaction-amount ${transaction.type}">
                    ${transaction.type === "in"
                        ? "+"
                        : "-"}
                    ${formatMoney(
                        transaction.amount
                    )}
                </strong>

                <button
                    class="delete-btn"
                    onclick="deleteTransaction(${transaction.id})"
                >
                    🗑
                </button>

            </div>
        `;


        list.appendChild(item);

    });

}


/* ================= DELETE TRANSACTION ================= */

function deleteTransaction(id) {

    const confirmDelete =
        confirm(
            "Delete this transaction?"
        );

    if (!confirmDelete) return;


    transactions =
        transactions.filter(
            transaction =>
                transaction.id !== id
        );


    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );


    renderTransactions();

    updateExpectedCash();

    updateActualCash();

    updateReports();

}


/* ================= CLEAR TRANSACTIONS ================= */

function clearTransactions() {

    if (
        !confirm(
            "Delete all transaction history?"
        )
    ) {
        return;
    }


    transactions = [];


    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );


    renderTransactions();

    updateExpectedCash();

    updateActualCash();

    updateReports();

}


/* ================= RESET COUNTER ================= */

function resetCounter() {

    if (
        !confirm(
            "Reset all counted notes and coins?"
        )
    ) {
        return;
    }


    cashCounts = {};


    localStorage.setItem(
        "cashCounts",
        JSON.stringify(cashCounts)
    );


    createCashTables();

    calculateCash();

}


/* ================= RESET DASHBOARD CASH ================= */

function resetDashboardCash() {

    resetCounter();

}


/* ================= RESET CASH FLOW ================= */

function resetCashFlow() {

    if (
        !confirm(
            "Reset current cash flow?"
        )
    ) {
        return;
    }


    cashFlowResetAt =
        Date.now();

    openingCash = 0;

    actualCash = 0;

    cashCounts = {};


    localStorage.setItem(
        "cashFlowResetAt",
        cashFlowResetAt
    );

    localStorage.setItem(
        "openingCash",
        "0"
    );

    localStorage.setItem(
        "actualCash",
        "0"
    );

    localStorage.setItem(
        "cashCounts",
        JSON.stringify({})
    );


    document.getElementById(
        "openingCash"
    ).value = "";


    document.getElementById(
        "actualCash"
    ).value = "";


    createCashTables();

    calculateCash();

    updateExpectedCash();

    updateActualCash();

    updateReports();

    alert(
        "Cash flow reset successfully."
    );

}


/* ================= OPENING CASH ================= */

function updateOpeningCash() {

    const input =
        document.getElementById(
            "openingCash"
        );

    openingCash =
        Number(input.value) || 0;


    localStorage.setItem(
        "openingCash",
        openingCash
    );


    updateExpectedCash();

    updateActualCash();

    updateReports();

}


/* ================= ACTUAL CASH INPUT ================= */

function updateActualInput() {

    const input =
        document.getElementById(
            "actualCash"
        );

    actualCash =
        Number(input.value) || 0;


    localStorage.setItem(
        "actualCash",
        actualCash
    );


    updateActualCash();

    updateReports();

}


/* ================= NAVIGATION ================= */

function showSection(sectionId) {

    document
        .querySelectorAll(".page-section")
        .forEach(section => {

            section.classList.remove(
                "active"
            );

        });


    const section =
        document.getElementById(
            sectionId
        );


    if (!section) return;


    section.classList.add("active");


    document
        .querySelectorAll(".nav-btn")
        .forEach(button => {

            button.classList.remove(
                "active"
            );

            if (
                button.dataset.section ===
                sectionId
            ) {

                button.classList.add(
                    "active"
                );

            }

        });


    const titles = {

        dashboard: "Dashboard",

        counter: "Cash Counter",

        transactions: "Transactions",

        reports: "Reports"

    };


    setText(
        "pageTitle",
        titles[sectionId] ||
        "Cash Counter"
    );

}


/* ================= OPEN COUNTER ================= */

function goToCounter() {

    showSection("counter");

}


/* ================= DARK MODE ================= */

function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );


    const isDark =
        document.body.classList.contains(
            "dark"
        );


    localStorage.setItem(
        "darkMode",
        isDark
    );


    const button =
        document.getElementById(
            "themeBtn"
        );


    if (button) {

        button.textContent =
            isDark
                ? "☀️ Light Mode"
                : "🌙 Dark Mode";

    }

}


/* ================= PRINT ================= */

function printPage() {

    window.print();

}


/* ================= CSV EXPORT ================= */

function exportCSV() {

    let csv =
        "Type,Denomination,Quantity,Amount\n";


    notes.forEach(value => {

        const key =
            `note_${value}`;

        const quantity =
            Number(cashCounts[key]) || 0;

        const amount =
            value * quantity;

        csv +=
            `Note,${value},${quantity},${amount}\n`;

    });


    coins.forEach(value => {

        const key =
            `coin_${value}`;

        const quantity =
            Number(cashCounts[key]) || 0;

        const amount =
            value * quantity;

        csv +=
            `Coin,${value},${quantity},${amount}\n`;

    });


    csv += "\nTransactions\n";

    csv +=
        "Type,Description,Amount,Date\n";


    transactions.forEach(transaction => {

        csv +=
            `${transaction.type},` +
            `"${transaction.description}",` +
            `${transaction.amount},` +
            `"${new Date(
                transaction.timestamp
            ).toLocaleString("en-IN")}"\n`;

    });


    const blob =
        new Blob(
            [csv],
            { type: "text/csv" }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "cash-counter-report.csv";


    link.click();


    URL.revokeObjectURL(url);

}


/* ================= REPORT ================= */

function updateReports() {

    const cashIn =
        getCashIn();

    const cashOut =
        getCashOut();

    const expected =
        getExpectedCash();

    const actual =
        getActualCash();

    const difference =
        actual - expected;


    setText(
        "reportOpening",
        formatMoney(openingCash)
    );

    setText(
        "reportIn",
        formatMoney(cashIn)
    );

    setText(
        "reportOut",
        formatMoney(cashOut)
    );

    setText(
        "reportExpected",
        formatMoney(expected)
    );

    setText(
        "reportActual",
        formatMoney(actual)
    );

    setText(
        "reportDifference",
        formatMoney(difference)
    );


    updateReportBreakdown();

}


/* ================= REPORT BREAKDOWN ================= */

function updateReportBreakdown() {

    const table =
        document.getElementById(
            "reportBreakdown"
        );

    if (!table) return;


    table.innerHTML = "";


    notes.forEach(value => {

        addReportRow(
            table,
            "💵 Note",
            value,
            `note_${value}`
        );

    });


    coins.forEach(value => {

        addReportRow(
            table,
            "🪙 Coin",
            value,
            `coin_${value}`
        );

    });

}


/* ================= REPORT ROW ================= */

function addReportRow(
    table,
    type,
    value,
    key
) {

    const quantity =
        Number(cashCounts[key]) || 0;

    const amount =
        quantity * value;


    const row =
        document.createElement("tr");


    row.innerHTML = `

        <td>${type}</td>

        <td>₹${value}</td>

        <td>${quantity}</td>

        <td>
            <strong>
                ${formatMoney(amount)}
            </strong>
        </td>

    `;


    table.appendChild(row);

}


/* ================= ESCAPE HTML ================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ================= EVENTS ================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* DATE */

        updateDate();


        /* CREATE TABLE */

        createCashTables();


        /* CALCULATE */

        calculateCash();


        /* OPENING CASH */

        const openingInput =
            document.getElementById(
                "openingCash"
            );


        if (openingInput) {

            openingInput.value =
                openingCash || "";

            openingInput.addEventListener(
                "input",
                updateOpeningCash
            );

        }


        /* ACTUAL CASH */

        const actualInput =
            document.getElementById(
                "actualCash"
            );


        if (actualInput) {

            actualInput.value =
                actualCash || "";

            actualInput.addEventListener(
                "input",
                updateActualInput
            );

        }


        /* QUANTITY */

        document.addEventListener(
            "input",
            event => {

                if (
                    event.target.classList.contains(
                        "quantity-input"
                    )
                ) {

                    const type =
                        event.target.dataset.type;

                    const value =
                        Number(
                            event.target.dataset.value
                        );

                    const key =
                        `${type}_${value}`;


                    cashCounts[key] =
                        Math.max(
                            0,
                            Number(
                                event.target.value
                            ) || 0
                        );


                    calculateCash();

                }

            }
        );


        /* NAVIGATION */

        document
            .querySelectorAll(".nav-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        showSection(
                            button.dataset.section
                        );

                    }
                );

            });


        /* ADD TRANSACTION */

        document
            .getElementById(
                "addTransactionBtn"
            )
            .addEventListener(
                "click",
                addTransaction
            );


        /* RESET CASH FLOW */

        document
            .getElementById(
                "resetFlowBtn"
            )
            .addEventListener(
                "click",
                resetCashFlow
            );


        /* RESET COUNTER */

        document
            .getElementById(
                "resetCounterBtn"
            )
            .addEventListener(
                "click",
                resetCounter
            );


        /* DASHBOARD RESET */

        document
            .getElementById(
                "dashboardResetBtn"
            )
            .addEventListener(
                "click",
                resetDashboardCash
            );


        /* OPEN COUNTER */

        document
            .getElementById(
                "openCounterBtn"
            )
            .addEventListener(
                "click",
                goToCounter
            );


        /* SEARCH */

        document
            .getElementById(
                "searchTransaction"
            )
            .addEventListener(
                "input",
                renderTransactions
            );


        /* FILTER */

        document
            .getElementById(
                "transactionFilter"
            )
            .addEventListener(
                "change",
                renderTransactions
            );


        /* CLEAR TRANSACTIONS */

        document
            .getElementById(
                "clearTransactionsBtn"
            )
            .addEventListener(
                "click",
                clearTransactions
            );


        /* THEME */

        document
            .getElementById(
                "themeBtn"
            )
            .addEventListener(
                "click",
                toggleTheme
            );


        /* PRINT */

        document
            .getElementById(
                "printBtn"
            )
            .addEventListener(
                "click",
                printPage
            );


        /* CSV */

        document
            .getElementById(
                "csvBtn"
            )
            .addEventListener(
                "click",
                exportCSV
            );


        /* DARK MODE STORAGE */

        const savedDark =
            localStorage.getItem(
                "darkMode"
            );


        if (savedDark === "true") {

            document.body.classList.add(
                "dark"
            );

            document.getElementById(
                "themeBtn"
            ).textContent =
                "☀️ Light Mode";

        }


        /* TRANSACTIONS */

        renderTransactions();


        /* REPORT */

        updateReports();

    }
);