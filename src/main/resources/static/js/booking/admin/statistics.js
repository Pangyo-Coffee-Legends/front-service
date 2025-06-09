'use strict'

import {drawWeekCountChart, drawTimeCountChart, drawMonthlyCountChart} from '../utils/statistics.js';

const api = apiStore();

document.addEventListener('DOMContentLoaded', async () => {
    const bookings = await api.getAllBookingsList();
    const rooms = await api.getMeetingRooms();

    drawWeekCountChart(bookings, rooms);
    drawTimeCountChart(bookings, rooms);
    drawMonthlyCountChart(bookings, rooms);
})