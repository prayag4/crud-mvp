const BASE_URL = "/api/records";

export async function fetchRecords() {
    const response = await fetch(BASE_URL);
    return response.json();
}

export async function addRecord(record) {
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
    });
    return response.json();
}

export async function updateRecord(id, updatedData) {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
    });
    return response.json();
}

export async function deleteRecord(id) {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
    });
    return response.json();
}

export async function getImageURL(id){
    const response = await fetch(`${BASE_URL}/getImage/${id}`, {
        method: "GET",
    });
    return response.json();
}