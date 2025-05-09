document.addEventListener("DOMContentLoaded", function () {
    const sampleData = [
        {
            place: "부서 A",
            temp: 24.5,
            humid: 50,
            co2: 520,
            grade: "pleasant",
            time: "2025-05-08 12:30:00"
        },
        {
            place: "부서 B",
            temp: 25.8,
            humid: 55,
            co2: 630,
            grade: "normal",
            time: "2025-05-08 12:30:00"
        },
        {
            place: "회의실 A",
            temp: 26.3,
            humid: 60,
            co2: 920,
            grade: "unpleasant",
            time: "2025-05-08 12:30:00"
        },
        {
            place: "회의실 B",
            temp: 27.1,
            humid: 65,
            co2: 1200,
            grade: "unpleasant",
            time: "2025-05-08 12:30:00"
        }
    ];

    const tableBody = document.querySelector("#summary-table tbody");

    sampleData.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row.place}</td>
            <td>${row.temp}</td>
            <td>${row.humid}</td>
            <td>${row.co2}</td>
            <td class="${row.grade}">${gradeText(row.grade)}</td>
            <td>${row.time}</td>
        `;
        tableBody.appendChild(tr);
    });

    $("#summary-table").DataTable({
        language: {
            url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/ko.json"
        }
    });
});

function gradeText(grade) {
    switch (grade) {
        case "pleasant": return "쾌적";
        case "normal": return "보통";
        case "unpleasant": return "불쾌";
        default: return "-";
    }
}
