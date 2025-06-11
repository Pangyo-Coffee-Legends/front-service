document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.querySelector("#roomTable tbody");

    try {
        const response = await fetch("/api/rooms", { credentials: "include" });
        const rooms = await response.json();

        rooms.forEach((room, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
        <td>${index + 1}</td>
        <td>${room.name}</td>
        <td>${room.location}</td>
        <td>${room.capacity}명</td>
      `;
            tableBody.appendChild(row);
        });

    } catch (err) {
        console.error("회의실 목록을 불러오는 데 실패했습니다:", err);
        tableBody.innerHTML = `<tr><td colspan="4">불러오기에 실패했습니다.</td></tr>`;
    }
});