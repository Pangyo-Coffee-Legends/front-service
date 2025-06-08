'use strict';

export { addChart, drawWeekCountChart, drawTimeCountChart, drawMonthlyCountChart }

const container = document.querySelector('.container');

function addChart(chartId, chartType, chartData, chartOptions, useFilter = false) {
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

    let filterElements = null;
    if (useFilter) {
        const filter = document.createElement('div');
        filter.className = 'row mb-3 align-items-end';
        filter.innerHTML = `
            <div class="col-md-2">
                <label class="form-label">연도</label>
                <select id="yearSelector" class="form-select"></select>
            </div>
            <div class="col-md-2">
                <label class="form-label">월</label>
                <select id="monthSelector" class="form-select"></select>
            </div>
            <div class="col-md-2">
                <label class="form-label">주차</label>
                <select id="weekSelector" class="form-select" style="min-width: 180px;"></select>
<!--                <select id="weekSelector" class="form-select"></select>-->
            </div>
        `;
        cardBody.appendChild(filter);
        filterElements = filter;
    }

    cardBody.appendChild(cardTitle);
    cardBody.appendChild(canvas);
    card.appendChild(cardBody);
    col.appendChild(card);
    container.appendChild(card);

    const chart = new Chart(canvas.getContext('2d'), {
        type: chartType,
        data: chartData,
        options: chartOptions
    });

    return { chart, filterElements };
}

function drawMonthlyCountChart(bookings, rooms) {
    const allRooms = rooms.map(r => r.meetingRoomName);

    const countMap = {}; // { roomName: { '2025-05': count } }
    const monthSet = new Set();

    bookings.forEach(booking => {
        const room = booking.room.name;
        const date = new Date(booking.startsAt);
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthSet.add(yearMonth);

        if (!countMap[room]) countMap[room] = {};
        if (!countMap[room][yearMonth]) countMap[room][yearMonth] = 0;

        countMap[room][yearMonth]++;
    });

    const sortedMonths = Array.from(monthSet).sort();

    const datasets = allRooms.map((room, idx) => {
        const monthlyCounts = countMap[room] || {};
        return {
            label: room,
            data: sortedMonths.map(month => monthlyCounts[month] || 0),
            borderColor: `hsl(${(idx * 60) % 360}, 70%, 50%)`,
            backgroundColor: `hsla(${(idx * 60) % 360}, 70%, 50%, 0.2)`,
            fill: false,
            tension: 0.3
        };
    });

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
        },
        ticks: {
            stepSize: 1
        }
    };

    addChart('회의실 월별 예약', 'line', chartData, chartOptions);
}



function drawTimeCountChart(bookings, rooms) {
    const allRooms = rooms.map(r => r.meetingRoomName);

    const timeSlots = [
        "09:00", "10:00", "11:00", "12:00",
        "13:00", "14:00", "15:00", "16:00", "17:00"
    ];

    const countMap = {};

    bookings.forEach(booking => {
        const room = booking.room.name;
        const startTime = booking.startsAt.split('T')[1].substring(0, 5);

        if (!countMap[room]) {
            countMap[room] = {};
        }

        if (!countMap[room][startTime]) {
            countMap[room][startTime] = 0;
        }

        countMap[room][startTime]++;
    });

    const datasets = allRooms.map((room, idx) => {
        const timeCounts = countMap[room] || {};
        return {
            label: room,
            data: timeSlots.map(time => timeCounts[time] || 0),
            backgroundColor: `hsla(${(idx * 60) % 360}, 70%, 50%, 0.6)`
        };
    });

    const chartData = {
        labels: timeSlots,
        datasets: datasets
    };

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
        },
        ticks: {
            stepSize: 1
        }
    };

    addChart('시간별 회의실 예약 수', 'bar', chartData, chartOption);
}

function drawWeekCountChart(bookings, rooms) {
    const allRooms = rooms.map(r => r.meetingRoomName);

    const { chart, filterElements } = addChart(
        '요일별 회의실 예약 수',
        'bar',
        { labels: [], datasets: [] },
        {
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
            },
            ticks: {
                stepSize: 1
            }
        },
        true
    );

    const yearSelector = filterElements.querySelector('#yearSelector');
    const monthSelector = filterElements.querySelector('#monthSelector');
    const weekSelector = filterElements.querySelector('#weekSelector');

    const allDates = bookings.map(b => new Date(b.startsAt));
    const uniqueYears = [...new Set(allDates.map(d => d.getFullYear()))].sort();
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    yearSelector.innerHTML = uniqueYears.map(y =>
        `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}년</option>`
    ).join('');

    monthSelector.innerHTML = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        return `<option value="${month}" ${month === currentMonth ? 'selected' : ''}>${month}월</option>`;
    }).join('');

    function updateWeekOptions() {
        const year = parseInt(yearSelector.value);
        const month = parseInt(monthSelector.value) - 1;
        const weeks = getWeeksInMonth(year, month);

        weekSelector.innerHTML = weeks.map((w, i) =>
            `<option value="${i}">${i + 1}주차 (${w.start.toLocaleDateString()} ~ ${w.end.toLocaleDateString()})</option>`
        ).join('');

        const today = new Date();
        const todayWeekIndex = weeks.findIndex(w => today >= w.start && today <= w.end);
        if (todayWeekIndex !== -1) {
            weekSelector.value = todayWeekIndex;
        }
    }

    function updateChart() {
        const year = parseInt(yearSelector.value);
        const month = parseInt(monthSelector.value) - 1;
        const weekIndex = parseInt(weekSelector.value);
        const weekRange = getWeeksInMonth(year, month)[weekIndex];

        const filtered = bookings.filter(b => {
            const date = new Date(b.startsAt);
            return date >= weekRange.start && date <= weekRange.end;
        });

        const roomWeekdayMap = {};
        filtered.forEach(booking => {
            const room = booking.room.name;
            const weekday = getWeekdayIndex(booking.startsAt);
            if (!roomWeekdayMap[room]) {
                roomWeekdayMap[room] = Array(7).fill(0);
            }
            roomWeekdayMap[room][weekday]++;
        });

        chart.data.labels = ['월', '화', '수', '목', '금', '토', '일'];
        chart.data.datasets = allRooms.map((room, idx) => ({
            label: room,
            data: roomWeekdayMap[room] || Array(7).fill(0),
            backgroundColor: `hsla(${(idx * 60) % 360}, 70%, 50%, 0.6)`
        }));

        chart.update();
    }

    yearSelector.addEventListener('change', () => {
        updateWeekOptions();
        updateChart();
    });
    monthSelector.addEventListener('change', () => {
        updateWeekOptions();
        updateChart();
    });
    weekSelector.addEventListener('change', updateChart);

    updateWeekOptions();
    updateChart();
}



// todo 취소 비율

function getWeeksInMonth(year, month) {
    const weeks = [];
    let start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);

    while (start <= end) {
        const weekStart = new Date(start);
        const weekEnd = new Date(start);
        weekEnd.setDate(weekEnd.getDate() + 6 - weekEnd.getDay() + 1);
        if (weekEnd > end) weekEnd.setTime(end.getTime());

        weeks.push({ start: new Date(weekStart), end: new Date(weekEnd) });

        start = new Date(weekEnd);
        start.setDate(start.getDate() + 1);
    }

    return weeks;
}



function getWeekdayIndex(dateString) {
    const date = new Date(dateString);
    const day = date.getDay(); // 일=0, 월=1, ..., 토=6
    return (day + 6) % 7; // 월=0, ..., 일=6
}