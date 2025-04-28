function apiStore(){
    const SERVER_URL="http://localhost:1051/api/v1/bookings";
    const api = new Object();

    api.getBookingByCode = async function (code){

        const response = await fetch(`${SERVER_URL}/code/${code}`);
        const data = await response.json();
        if(!response.ok){
            console.log(response.json());
        }

        return data;
    }

    return api;

}