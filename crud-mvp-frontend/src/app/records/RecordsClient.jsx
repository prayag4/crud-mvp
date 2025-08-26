"use client";
export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteRecord, getImageURL } from "@/services/api";
// import DatePicker from "react-datepicker";
import dynImport from "next/dynamic";        // ← give it any other name
// import dynamic from "next/dynamic";        // ← give it any other name
import "react-datepicker/dist/react-datepicker.css";

const TinyMCEEditor = dynImport(() => import("./components/TinyMCEEditor"), {
    ssr: false,
});


// ⬇️ DatePicker loads only in the browser; it’s skipped at build time
const DatePicker = dynImport(() => import("react-datepicker"), {
    ssr: false,
});
export default function RecordsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isFormOpen = searchParams.get("form") === "true";
    const recordId = searchParams.get("id");

    const [records, setRecords] = useState([]);
    const [newRecord, setNewRecord] = useState({
        name: "",
        description: "",
        singleLine: "",
        multiLine: "",
        richText: "",
        number: "",
        email: "",
        phone: "",
        singleSelect: "",
        multiSelect: [],
        file: null,
        radioOption: "",
        checkbox: false,
        date: null,
        dateRange: { start: null, end: null },
        time: "",
        timeRange: { start: "", end: "" },
        location: ""
    });

    // Fetch records initially
    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const res = await fetch("/api/records");
            if (!res.ok) {
                throw new Error('Failed to fetch records');
            }
            const data = await res.json();
            setRecords(data);
        } catch (err) {
            console.error("Error fetching records:", err);
        }
    };

    // Fetch record details when editing
    useEffect(() => {
        const fetchRecordDetails = async () => {
            if (!recordId) {
                setNewRecord({
                    name: "",
                    description: "",
                    singleLine: "",
                    multiLine: "",
                    richText: "",
                    number: "",
                    email: "",
                    phone: "",
                    singleSelect: "",
                    multiSelect: [],
                    file: null,
                    radioOption: "",
                    checkbox: false,
                    date: null,
                    dateRange: { start: null, end: null },
                    time: "",
                    timeRange: { start: "", end: "" },
                    location: ""
                });
                return;
            }

            try {
                const res = await fetch(`/api/records/${recordId}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch record details');
                }
                const data = await res.json();
                if (data.record) {
                    // let getImageURLfun = await getImageURL(recordId)
                    setNewRecord({
                        name: data.record.name || "",
                        description: data.record.description || "",
                        singleLine: data.record.singleLine || "",
                        multiLine: data.record.multiLine || "",
                        richText: data.record.richText || "",
                        number: data.record.number || "",
                        email: data.record.email || "",
                        phone: data.record.phone || "",
                        singleSelect: data.record.singleSelect || "",
                        multiSelect: data.record.multiSelect || [],
                        file: data.record.file || null,
                        radioOption: data.record.radioOption || "",
                        checkbox: data.record.checkbox === "true" ? true : false,
                        date: data.record.date ? new Date(data.record.date) : null,
                        dateRange: {
                            start: data.record.dateRangeStart ? new Date(data.record.dateRangeStart) : null,
                            end: data.record.dateRangeEnd ? new Date(data.record.dateRangeEnd) : null
                        },
                        time: data.record.time || "",
                        timeRange: {
                            start: data.record.timeRangeStart || "",
                            end: data.record.timeRangeEnd || ""
                        },
                        location: data.record.location || "",
                        // urlImage : `${getImageURLfun}` || ""    
                    });
                }
            } catch (err) {
                console.error("Error fetching record:", err);
            }
        };

        fetchRecordDetails();
    }, [recordId, isFormOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = recordId ? "PUT" : "POST";
        const url = recordId ? `/api/records/${recordId}` : "/api/records";

        try {
            const formData = new FormData();

            // Add all fields to FormData
            Object.keys(newRecord).forEach(key => {
                if (key === 'file') {
                    if (newRecord.file instanceof File) {
                        formData.append('file', newRecord.file); // new file
                    } else if (newRecord.file?.path) {
                        // Pass existing file path as a hidden fallback value
                        formData.append('existingFilePath', newRecord.file.path);
                    }

                } else if (key === 'date') {
                    formData.append(key, newRecord[key] instanceof Date ? newRecord[key].toISOString() : '');
                } else if (key === 'dateRange') {
                    formData.append('dateRangeStart', newRecord[key].start instanceof Date ? newRecord[key].start.toISOString() : '');
                    formData.append('dateRangeEnd', newRecord[key].end instanceof Date ? newRecord[key].end.toISOString() : '');
                } else if (key === 'timeRange') {
                    formData.append('timeRangeStart', newRecord[key].start || '');
                    formData.append('timeRangeEnd', newRecord[key].end || '');
                } else if (key === 'multiSelect') {
                    // Handle array values
                    if (Array.isArray(newRecord[key])) {
                        newRecord[key].forEach(value => {
                            formData.append(`${key}[]`, value);
                        });
                    }
                } else {
                    // Handle all other fields
                    formData.append(key, newRecord[key] !== null && newRecord[key] !== undefined ? newRecord[key] : '');
                }
            });

            const res = await fetch(url, {
                method,
                body: formData,

            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to save record');
            }

            const data = await res.json();
            fetchRecords(); // Refresh records after update/add
            router.push("/records"); // Navigate back to list
            console.log(formData);
        } catch (err) {
            console.error("Error saving record:", err);
        }
    };

    // If form is open, render the form page
    if (isFormOpen) {
        return (
            <div className="p-5">
                <h1 className="text-2xl font-bold">{recordId ? "Edit" : "Add"} Record</h1>
                <form onSubmit={handleSubmit} className="my-4 space-y-4">
                    {/* Single Line Text */}
                    <div>
                        <label htmlFor="singleLine" className="block text-sm font-medium text-gray-700 mb-1">
                            Single Line *
                        </label>
                        <input
                            id="singleLine"
                            type="text"
                            required
                            value={newRecord.singleLine}
                            onChange={(e) => setNewRecord({ ...newRecord, singleLine: e.target.value })}
                            className="border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                    </div>

                    {/* Multi Line Text */}
                    <div>
                        <label htmlFor="multiLine" className="block text-sm font-medium text-gray-700 mb-1">
                            Multi Line
                        </label>
                        <textarea
                            id="multiLine"
                            value={newRecord.multiLine}
                            onChange={(e) => setNewRecord({ ...newRecord, multiLine: e.target.value })}
                            className="border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            rows="4"
                        />
                    </div>
                    {/* ✅ TinyMCE Rich Text Editor */}
                    <div>
                        <label htmlFor="richText" className="block text-sm font-medium text-gray-700 mb-1">
                            Rich Text Editor
                        </label>
                        <TinyMCEEditor
                            value={newRecord.richText}
                            onChange={(content) => setNewRecord({ ...newRecord, richText: content })}
                        />
                    </div>

                    {/* Number */}
                    <div>
                        <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
                            Number
                        </label>
                        <input
                            id="number"
                            type="number"
                            value={newRecord.number}
                            onChange={(e) => setNewRecord({ ...newRecord, number: e.target.value })}
                            className="border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={newRecord.email}
                            onChange={(e) => setNewRecord({ ...newRecord, email: e.target.value })}
                            className="border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            value={newRecord.phone}
                            onChange={(e) => setNewRecord({ ...newRecord, phone: e.target.value })}
                            className="border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                    </div>

                    {/* Single Selection */}
                    <div>
                        <label htmlFor="singleSelect" className="block text-sm font-medium text-gray-700 mb-1">
                            Single Selection
                        </label>
                        <select
                            id="singleSelect"
                            value={newRecord.singleSelect}
                            onChange={(e) => setNewRecord({ ...newRecord, singleSelect: e.target.value })}
                            className="border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                            <option value="">Select an option</option>
                            <option value="option1">Option 1</option>
                            <option value="option2">Option 2</option>
                            <option value="option3">Option 3</option>
                        </select>
                    </div>

                    {/* Multiple Selection */}
                    <div>
                        <label htmlFor="multiSelect" className="block text-sm font-medium text-gray-700 mb-1">
                            Multiple Selection
                        </label>
                        <select
                            id="multiSelect"
                            multiple
                            size="3"
                            value={newRecord.multiSelect}
                            onChange={(e) => {
                                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                                setNewRecord({ ...newRecord, multiSelect: selectedOptions });
                            }}
                            className="border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                            <option value="option1">Option 1</option>
                            <option value="option2">Option 2</option>
                            <option value="option3">Option 3</option>
                            <option value="option4">Option 4</option>
                            <option value="option5">Option 5</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple options</p>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                            File Upload
                        </label>
                        <input
                            id="file"
                            type="file"
                            onChange={(e) => setNewRecord({ ...newRecord, file: e.target.files[0] })}
                            className="border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            accept=".jpg,.jpeg,.png,.pdf"
                        />
                        {newRecord.file && (
                            <div className="mt-2">
                                {
                                    newRecord.file.originalName &&
                                    <>
                                        <p className="text-sm text-gray-600">Selected file: {newRecord.file.originalName}</p>
                                        <img
                                            // src={`http://localhost:5000/${newRecord.file.path}`} 
                                            src={newRecord.file.path}
                                            // src={}
                                            alt="Preview"
                                            className="mt-2 max-h-32"
                                        />
                                    </>
                                }

                            </div>
                        )}
                    </div>
                    {/* Radio Buttons */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Radio Buttons
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="option1"
                                    checked={newRecord.radioOption === "option1"}
                                    onChange={(e) => setNewRecord({ ...newRecord, radioOption: e.target.value })}
                                    className="mr-2 text-blue-500"
                                />
                                <span className="text-gray-700">Option 1</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="option2"
                                    checked={newRecord.radioOption === "option2"}
                                    onChange={(e) => setNewRecord({ ...newRecord, radioOption: e.target.value })}
                                    className="mr-2 text-blue-500"
                                />
                                <span className="text-gray-700">Option 2</span>
                            </label>
                        </div>
                    </div>

                    {/* Checkbox */}
                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={newRecord.checkbox === true}
                                onChange={(e) => setNewRecord({ ...newRecord, checkbox: e.target.checked })}
                                className="mr-2 text-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Checkbox</span>
                        </label>
                    </div>

                    {/* Date Picker */}
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                        </label>
                        <DatePicker
                            id="date"
                            selected={newRecord.date}
                            onChange={(date) => setNewRecord({ ...newRecord, date })}
                            className="border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            dateFormat="dd-MM-yyyy"
                            minDate={new Date(1900, 0, 1)}
                            maxDate={new Date(2100, 11, 31)}
                            showYearDropdown
                            showMonthDropdown
                            scrollableYearDropdown
                            yearDropdownItemNumber={100}
                            placeholderText="DD-MM-YYYY"
                        />
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date Range
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="dateRangeStart" className="block text-xs text-gray-600 mb-1">Start Date</label>
                                <DatePicker
                                    id="dateRangeStart"
                                    selected={newRecord.dateRange.start}
                                    onChange={(date) => setNewRecord({ ...newRecord, dateRange: { ...newRecord.dateRange, start: date } })}
                                    className="border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    dateFormat="dd-MM-yyyy"
                                    minDate={new Date(1900, 0, 1)}
                                    maxDate={new Date(2100, 11, 31)}
                                    showYearDropdown
                                    showMonthDropdown
                                    scrollableYearDropdown
                                    yearDropdownItemNumber={100}
                                    placeholderText="DD-MM-YYYY"
                                />
                            </div>
                            <div>
                                <label htmlFor="dateRangeEnd" className="block text-xs text-gray-600 mb-1">End Date</label>
                                <DatePicker
                                    id="dateRangeEnd"
                                    selected={newRecord.dateRange.end}
                                    onChange={(date) => setNewRecord({ ...newRecord, dateRange: { ...newRecord.dateRange, end: date } })}
                                    className="border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    dateFormat="dd-MM-yyyy"
                                    minDate={newRecord.dateRange.start || new Date(1900, 0, 1)}
                                    maxDate={new Date(2100, 11, 31)}
                                    showYearDropdown
                                    showMonthDropdown
                                    scrollableYearDropdown
                                    yearDropdownItemNumber={100}
                                    placeholderText="DD-MM-YYYY"

                                />
                            </div>
                        </div>
                    </div>

                    {/* Time Picker */}
                    <div>
                        <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                            Time
                        </label>
                        <input
                            id="time"
                            type="text"
                            value={newRecord.time}
                            onChange={(e) => setNewRecord({ ...newRecord, time: e.target.value })}
                            className="border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            step="300"
                        />
                    </div>

                    {/* Time Range 
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Time Range
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="timeRangeStart" className="block text-xs text-gray-600 mb-1">Start Time</label>
                                <input
                                    id="timeRangeStart"
                                    type="time"
                                    value={newRecord.timeRange.start}
                                    onChange={(e) => setNewRecord({...newRecord, timeRange: {...newRecord.timeRange, start: e.target.value}})}
                                    className="border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    step="300"
                                />
                            </div>
                            <div>
                                <label htmlFor="timeRangeEnd" className="block text-xs text-gray-600 mb-1">End Time</label>
                                <input
                                    id="timeRangeEnd"
                                    type="time"
                                    value={newRecord.timeRange.end}
                                    onChange={(e) => setNewRecord({...newRecord, timeRange: {...newRecord.timeRange, end: e.target.value}})}
                                    className="border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    step="300"
                                    min={newRecord.timeRange.start}
                                />
                            </div>
                        </div>
                    </div>
                    */}

                    {/* Location */}
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                        </label>
                        <input
                            id="location"
                            type="text"
                            value={newRecord.location}
                            onChange={(e) => setNewRecord({ ...newRecord, location: e.target.value })}
                            placeholder="Enter location"
                            className="border border-gray-300 p-2 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                            {recordId ? "Update" : "Save"}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/records")}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // Otherwise, render the table page
    return (
        <div className="p-5">
            <h1 className="text-2xl font-bold">Records</h1>
            <button
                onClick={() => { router.push("/records?form=true") }}
                className="bg-green-500 text-white px-4 py-2 my-4"
            >
                Add Record
            </button>

            <table className="w-full border">
                <thead>
                    <tr>
                        <th className="border p-2">ID</th>
                        <th className="border p-2">Single Line Text</th>
                        <th className="border p-2">Number</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((record, index) => (
                        <tr key={record.id || index}>
                            <td className="border p-2">{record.id}</td>
                            <td className="border p-2">{record.singleLine}</td>
                            <td className="border p-2">{record.number}</td>
                            <td className="border p-2">
                                <button
                                    onClick={() => router.push(`/records?form=true&id=${record.id}`)}
                                    className="bg-yellow-500 text-white px-2 py-1 mr-2"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={async () => { await deleteRecord(record.id), fetchRecords() }}
                                    className="bg-red-500 text-white px-2 py-1">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}