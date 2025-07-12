// ... existing code ...
    const [records, setRecords] = useState([]);
    const [newRecord, setNewRecord] = useState({ name: "", description: "" });
// ... existing code ...
                const data = await res.json();
                setNewRecord({ name: data.requestJson[0].name || "", description: data.requestJson[0].description || "" });
// ... existing code ...
                body: JSON.stringify({ name: newRecord.name, description: newRecord.description }),
// ... existing code ...
                    <input
                        type="text"
                        value={newRecord.name}
                        onChange={(e) => setNewRecord({...newRecord, name: e.target.value})}
                        placeholder="Enter record name"
                        className="border p-2 mr-2"
                        required
                    />
                    <input
                        type="text"
                        value={newRecord.description}
                        onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
                        placeholder="Enter description"
                        className="border p-2 mr-2"
                        required
                    />
// ... existing code ...
                        <th className="border p-2">ID</th>
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Description</th>
                        <th className="border p-2">Actions</th>
// ... existing code ...
                            <td className="border p-2">{record.id}</td>
                            <td className="border p-2">{record.name}</td>
                            <td className="border p-2">{record.description}</td>
// ... existing code ...