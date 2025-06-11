export {GetAPI, PostAPI, PutAPI, DeleteAPI, PatchAPI}

const SERVER_URL = `http://localhost:10251/api/v1`


function GetAPI (uri) {
    return fetch(`${SERVER_URL}/${uri}`, {method: 'GET', credentials: 'include'});
}

function PostAPI(uri, body) {
    return fetch(`${SERVER_URL}${uri}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        credentials: 'include'
    });
}

function PutAPI(uri, body) {
    return fetch(`${SERVER_URL}${uri}`, {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        credentials: 'include'
    });
}

function DeleteAPI(uri) {
    return fetch(`${SERVER_URL}${uri}`, {method: 'DELETE', credentials: 'include'});
}

function PatchAPI(uri, body) {
    return fetch(`${SERVER_URL}${uri}`, {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        credentials: 'include'
    });
}