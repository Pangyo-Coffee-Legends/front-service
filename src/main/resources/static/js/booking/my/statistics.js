'use strict'

import {drawWeekCountChart, drawTimeCountChart, drawMonthlyCountChart} from '../utils/statistics.js';

const api = apiStore();

document.addEventListener('DOMContentLoaded', async () => {
    const bookings = await api.getMemberBookingsList();

    drawWeekCountChart(bookings);
    drawTimeCountChart(bookings);
    drawMonthlyCountChart(bookings);
})