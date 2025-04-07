import { useForm } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { toast } from 'react-toastify';


const schema = yup.object().shape({
  ocena: yup
    .number("Ocena musi być liczbą")
    .min(1, "Ocena musi być co najmniej 1")
    .max(5, "Ocena nie może być wyższa niż 5")
    .required("To pole jest wymagane"),
  komentarz: yup.string().max(500, "Komentarz nie może mieć więcej niż 500 znaków"),
});

export const Formularz = ({ onNewOpinion }) => {
  const { id } = useParams();
  const { userId } = useAuth();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(schema),
  });

  const [rating, setRating] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Funkcja obsługująca kliknięcia gwiazdek
  const handleStarClick = (index) => {
    setRating(index + 1);
    setValue("ocena", index + 1);
  };


  const handleFormSubmit = async (data) => {
    if (!userId) {
      setError("Musisz być zalogowany/a, aby dodać opinię!");
      return;
    }

    const formData = new FormData();
    formData.append("ocena", data.ocena);
    formData.append("komentarz", data.komentarz);
    if (selectedFile) {
      formData.append("zdjecie_url", selectedFile);
    } 
    formData.append("user_id", userId);
    await onSubmit(formData);
  };

  // dodanie opinii do bazy
  const onSubmit = async (formData) => {
    if (!userId) {
      setError("Musisz być zalogowany/a aby dodać opinię!");
      toast.error("Musisz być zalogowany/a aby dodać opinię!")
      return;
    }

    const token = localStorage.getItem('authToken');
    console.log("Token from localStorage:", token);
    
    try {
      const response = await fetch(`http://localhost:3002/lowiska/${id}/ocena`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const newOpinion = await response.json();
        setSuccess("Opinia została dodana!");
        toast.success("Dodano opinie!")
        onNewOpinion(newOpinion);
      } else {
        const errorText = await response.text();
        setError(`Błąd: ${errorText}`);
        toast.error("Wystąpił błąd podczas dodawania opinii")
      }
    } catch (error) {
      console.error('Network or server error:', error);
      setError("Wystąpił błąd sieciowy. Spróbuj ponownie.");
    }
  };

  const deleteUrl = () => {
    setSelectedFile(null);
    setValue("zdjecie_url", null)
  }


  return (
    <div className="xForm">
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <p style={{ color: 'black' }}>Byłeś już na tym łowisku? Podziel się z innymi swoimi zdobyczami!</p>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(handleFormSubmit)(e); }}>
        <div className="stars">
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              key={index}
              className={`star ${index < rating ? "filled" : ""}`}
              onClick={() => handleStarClick(index)}
            >
              ★
            </span>
          ))}
        </div>
        {errors.ocena && <p>{errors.ocena.message}</p>}

        <input
          type="text"
          placeholder="Twój komentarz..."
          {...register("komentarz")}
        />
        {errors.komentarz && <p>{errors.komentarz.message}</p>}

        <input
          type="file"
          accept="image/*"
          {...register("zdjecie_url")}
          onChange={(e) => {
            const file = e.target.files[0];
            setSelectedFile(file);
            setValue("zdjecie_url", file);
          }}
        />
        {selectedFile && (
          <div>
            <p>Wybrany plik: {selectedFile.name}</p>
            <button type="button" onClick={deleteUrl}>Usuń plik</button>
          </div>
        )}
        {errors.zdjecie_url && <p>{errors.zdjecie_url.message}</p>}
        

        <input type="submit" value="Wyślij Opinię" />
      </form>
    </div>
  );
};
