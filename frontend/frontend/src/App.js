import React, { useEffect, useState } from "react";

const App = () => {
    const [appointments, setAppointments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAppointment, setCurrentAppointment] = useState(null);

    // Charger les rendez-vous
    useEffect(() => {
        fetch("http://localhost:5000/api/appointments")
            .then(response => response.json())
            .then(data => {
                console.log("Données récupérées :", data); // DEBUG
                setAppointments(data);
            })
            .catch(error => console.error("Erreur:", error));
    }, []);
    

    // Ouvrir le formulaire pour modification
    const openEditForm = (appointment) => {
        setIsEditing(true);
        setCurrentAppointment({ ...appointment });
        setShowForm(true);
    };

    // Gérer les changements de formulaire
    const handleChange = (e) => {
        setCurrentAppointment({ ...currentAppointment, [e.target.name]: e.target.value });
    };

    // Gérer l'ajout ou la modification
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let formattedAppointment = { ...currentAppointment };
        if (formattedAppointment.heure) {
            formattedAppointment.heure += ":00"; 
        }
    
        console.log("Données envoyées :", formattedAppointment); // DEBUG
    
        const method = isEditing ? "PUT" : "POST";
        const url = isEditing
        ? `http://localhost:5000/api/appointments/${currentAppointment._id}`
        : "http://localhost:5000/api/appointments"; // GUILLEMET AJOUTÉ ICI
    
        try {
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formattedAppointment),
            });
    
            if (response.ok) {
                const updatedAppointment = await response.json();
                setAppointments(prev =>
                    isEditing
                        ? prev.map(appt => (appt._id === updatedAppointment._id ? updatedAppointment : appt))
                        : [...prev, updatedAppointment]
                );
                closeForm();
            } else {
                alert("Erreur lors de l'opération !");
            }
        } catch (error) {
            console.error("Erreur:", error);
        }
    };
    
    // Gérer la suppression d'un rendez-vous
    const handleDelete = async (id) => {
        if (!window.confirm("Voulez-vous vraiment supprimer ce rendez-vous ?")) return;

        try {
            const response = await fetch(`http://localhost:5000/api/appointments/${id}`, { method: "DELETE" });

            if (response.ok) {
                setAppointments(prev => prev.filter(appt => appt._id !== id));
            } else {
                alert("Erreur lors de la suppression !");
            }
        } catch (error) {
            console.error("Erreur:", error);
        }
    };

    // Fermer le formulaire et réinitialiser l'état
    const closeForm = () => {
        setIsEditing(false);
        setCurrentAppointment(null);
        setShowForm(false);
    };

    return (
        <div className="container">
            <button className="add-btn" onClick={() => { 
                setShowForm(true); 
                setIsEditing(false); 
                setCurrentAppointment({ date: "", heure: "", nom: "", email: "", motif: "" }); 
            }}>+</button>
            
            {showForm && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>{isEditing ? "Modifier le Rendez-vous" : "Ajouter un Rendez-vous"}</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="date" name="date" value={currentAppointment?.date || ""} onChange={handleChange} required />
                            <input type="time" name="heure" value={currentAppointment?.heure || ""} onChange={handleChange} required />
                            <input type="text" name="nom" value={currentAppointment?.nom || ""} onChange={handleChange} required />
                            <input type="email" name="email" value={currentAppointment?.email || ""} onChange={handleChange} required />
                            <textarea name="motif" value={currentAppointment?.motif || ""} onChange={handleChange} required />
                            <button type="submit">{isEditing ? "Modifier" : "Ajouter"}</button>
                            <button type="button" onClick={closeForm}>Annuler</button>
                        </form>
                    </div>
                </div>
            )}

            <h1>Liste des rendez-vous</h1>
            <ul>
    {appointments.map((appt) => (
        <li key={appt._id}>
            {appt.date} - {appt.heure} - {appt.nom} ({appt.motif})
            <button onClick={() => openEditForm(appt)}>Modifier</button>
            <button onClick={() => handleDelete(appt._id)} style={{ marginLeft: "10px", color: "red" }}>Supprimer</button>
        </li>
    ))}
</ul>

        </div>
    );
};

export default App;
