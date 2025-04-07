import { use, useState } from "react"
import { toast } from 'react-toastify';
export const DeleteOpinion = ({opiniaId, onDelete, onError, onSuccess}) => {

 

    // usuwanie opinii
    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                onError("Brak tokena autoryzacji");
                return;
            }

            const response = await fetch(`http://localhost:3002/api/opinia/${opiniaId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            });
            if (response.ok) {
                onSuccess("opinia została usunięta");
                onDelete(opiniaId);
                toast.success("usunięto opinię")
            } else {
                const errorText = await response.text();
                onError(`Błąd: ${errorText}`);
                toast.error("wystąpił błąd podczas usuwania opinii")
            }
    } catch (error) {
        console.error("Network error:", error);
        onError("Wystąpił błąd podczas usuwanai opinii")
    }
}

    return (
        <div>
            <button className="red-btn" onClick={handleDelete}>Usuń opinie</button>
        </div>
    )
}