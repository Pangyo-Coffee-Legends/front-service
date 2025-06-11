function formatStore() {
    const format = new Object();

    format.ampm = function (datetimeStr) {
        const date = new Date(datetimeStr);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? '오후' : '오전';

        hours = hours % 12;
        hours = hours ? hours : 12; // 0시는 12로 표시

        return `${yyyy}-${mm}-${dd} ${ampm} ${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    format.korAmPm = function (datetimeStr) {
        const date = new Date(datetimeStr);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? '오후' : '오전';

        hours = hours % 12;
        hours = hours ? hours : 12; // 0시는 12로 표시

        return `${yyyy}년${mm}월${dd}일 <br/> ${ampm} ${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    format.dateExtractTime = function (date) {
        return date.toTimeString().slice(0, 5);
    }

    format.time = function (timeStr) {
        const [hourStr, minuteStr] = timeStr.split(':');
        const hour = hourStr.padStart(2, '0');
        const minute = (minuteStr || '00').padStart(2, '0');
        return `${hour}:${minute}`;
    }

    format.to24Hour = function(timeStr) {
        let [hourStr, minuteStr] = timeStr.split(':');
        if(hourStr  < 6) {
            hourStr = parseInt(hourStr) + 12;
        }
        const hour = hourStr.toString().padStart(2, '0');
        const minute = (minuteStr || '00').padStart(2, '0');
        return `${hour}:${minute}`;
    }

    format.timeAsDate = function (timeStr) {
        const base = new Date();
        const [h, m] = timeStr.split(':');

        let hour = parseInt(h, 10);
        let minute = parseInt(m || '0', 10);

        if (timeStr.includes('오후') || hour < 8) {
            hour += 12;
        }

        base.setHours(hour, minute, 0, 0);
        return base;
    }

    format.dateTime = function(timeStr) {
        const date = new Date(timeStr);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작
        const day = String(date.getDate()).padStart(2, '0');

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
    return format;
}