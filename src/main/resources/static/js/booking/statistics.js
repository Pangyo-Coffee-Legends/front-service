'use strict';

const api = apiStore();
const container = document.querySelector('.container');

document.addEventListener('DOMContentLoaded', async function () {
    await drawWeekCountChart(); // 요일별
    await drawTimeCountChart(); // 시간별
    await drawMonthlyCountChart(); // 월별
    // await attendeeCountChart(); // 총 예약자
});

function addChart(chartId, chartType, chartData, chartOptions){
    const col = document.createElement('div');
    col.className = 'col-md-6 mb-4';

    const card = document.createElement('div');
    card.className = 'card shadow mb-4';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title';
    cardTitle.textContent = `${chartId}`;

    const canvas = document.createElement('canvas');
    canvas.id = chartId;

    cardBody.appendChild(cardTitle);
    cardBody.appendChild(canvas);
    card.appendChild(cardBody);
    col.appendChild(card);
    container.appendChild(card);

    new Chart(canvas.getContext('2d'), {
        type: chartType,
        data: chartData,
        options: chartOptions
    });
}

const drawMonthlyCountChart = async function () {
    const bookings = await api.getAllBookingsListList();

    const countMap = {}; // { roomName: { '2025-05': count, ... } }
    const monthSet = new Set(); // 모든 월을 수집해서 x축으로 사용

    bookings.forEach(booking => {
        const room = booking.roomName;
        const date = new Date(booking.date);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthSet.add(yearMonth);

        if (!countMap[room]) countMap[room] = {};
        if (!countMap[room][yearMonth]) countMap[room][yearMonth] = 0;

        countMap[room][yearMonth]++;
    });

    const sortedMonths = Array.from(monthSet).sort();

    const datasets = Object.entries(countMap).map(([room, monthlyCounts], idx) => ({
        label: room,
        data: sortedMonths.map(month => monthlyCounts[month] || 0),
        borderColor: `hsl(${(idx * 60) % 360}, 70%, 50%)`,
        backgroundColor: `hsla(${(idx * 60) % 360}, 70%, 50%, 0.2)`,
        fill: false,
        tension: 0.3
    }));

    const chartData = {
        labels: sortedMonths,
        datasets: datasets
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: '회의실 월별 예약 트렌드'
            },
            tooltip: {
                mode: 'index',
                intersect: false
            },
            legend: {
                position: 'bottom'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: '예약 건수'
                }
            },
            x: {
                title: {
                    display: true,
                    text: '월'
                }
            }
        }
    };

    addChart('회의실 월별 예약', 'line', chartData, chartOptions);
}


//
const drawTimeCountChart = async function(){
    const timeSlots = [
        "09:00",
        // "09:30",
        "10:00",
        // "10:30",
        "11:00",
        // "11:30",
        "12:00",
        // "12:30",
        "13:00",
        // "13:30",
        "14:00",
        // "14:30",
        "15:00",
        // "15:30",
        "16:00",
        // "16:30",
        "17:00",
        // "17:30"
    ];

    const bookings = await api.getAllBookingsListList();

    const countMap = {};

    bookings.forEach(booking => {
        const room = booking.roomName;
        const startTime = booking.date.split('T')[1].substring(0, 5);

        if (!countMap[room]) {
            countMap[room] = {};
        }

        if (!countMap[room][startTime]) {
            countMap[room][startTime] = 0;
        }

        countMap[room][startTime]++;
    });

    const datasets = Object.entries(countMap).map(([roomName, timeCount], idx) => ({
        label: roomName,
        data: timeSlots.map(time => timeCount[time] || 0),
        // backgroundColor: roomColorMap[roomName],
        // fill: false,
        // tension: 0.3
    }));

    const chartData = {
        labels: timeSlots,
        datasets: datasets
    }

    const chartOption = {
        plugins: {
            title: {
                display: true,
                text: '회의실별 사용 시간대'
            }
        },
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: '예약 횟수'
                }
            }
        }
    };
    addChart('시간별 회의실 예약 수', 'bar', chartData, chartOption)
}

const drawWeekCountChart = async function () {
    const bookings = await api.getAllBookingsListList();

    const roomWeekdayMap = {};

    bookings.forEach(booking => {
        const room = booking.roomName.trim();
        const weekday = getWeekdayIndex(booking.date); // 0~6 (월~일)

        if (!roomWeekdayMap[room]) {
            roomWeekdayMap[room] = Array(7).fill(0);
        }
        roomWeekdayMap[room][weekday]++;
    });

    const datasets = Object.entries(roomWeekdayMap).map(([roomName, counts]) => ({
        label: roomName,
        data: counts
    }));

    const chartData = {
        labels: ['월', '화', '수', '목', '금', '토', '일'],
        datasets: datasets
    };

    const chartOptions = {
        plugins: {
            title: {
                display: true,
                text: '요일별 회의실별 예약 수'
            }
        },
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: '예약 수'
                }
            }
        }
    };

    addChart('요일별 회의실 예약 수', 'bar', chartData, chartOptions);
};

// todo 취소 비율




function getWeekdayIndex(dateString) {
    const date = new Date(dateString);
    const day = date.getDay(); // 일=0, 월=1, ..., 토=6
    return (day + 6) % 7; // 월=0, ..., 일=6
}