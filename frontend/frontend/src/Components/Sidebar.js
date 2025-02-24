import React from "react";

const Sidebar = ({ appointments, onSelect }) => {
    return (
        <div className="w-1/4 h-screen bg-gray-800 text-white p-4 overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Historique des Rendez-vous</h2>
            <ul>
                {appointments.map((appt) => (
                    <li key={appt._id} 
                        className="mb-2 p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
                        onClick={() => onSelect(appt)}>
                        {appt.date} - {appt.nom}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
