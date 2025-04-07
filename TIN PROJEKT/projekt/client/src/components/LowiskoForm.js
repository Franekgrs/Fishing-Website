import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form"
import * as yup from 'yup';
import { useAuth } from "../AuthContext";
import { toast } from 'react-toastify';


const schema = yup.object().shape({
    nazwa: yup.string().min(1, 'nazwa nie moze byc pusta').max(50).required("To pole jest wymagane"),
    typ: yup.string().oneOf(["jezioro",'rzeka','staw','morze','kanał'], 'Wybierz typ').required("To pole jest wymagane"),
    opis: yup.string().max(400, 'przekroczono maksymalna ilosc znaków (400)'),
    lokalizacja: yup.string().min(1, "Podaj lokalizacje").max(50).required("to pole nie moze być puste"),
    data_otwarcia: yup.date().required("To pole jest wymagane").typeError("podaj odpowiedni format daty")
})



export const LowiskoForm = ({onNewLowisko}) => {

    const {register, handleSubmit, formState: {errors}, setValue} = useForm({
        resolver: yupResolver(schema)
    });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { userId } = useAuth();


    // funkcja obslugujaca dodanie lowiska do bazy
    const onSubmit = async (data) => {
        if (!userId) {
            setError("Musisz być zalogowany/a aby dodać łowisko!");
            return;
          }

          const formattedDate = new Date(data.data_otwarcia).toISOString().split('T')[0];

    const requestData = {
        ...data,
        data_otwarcia: formattedDate,
    };
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:3002/lowiska`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify(requestData),
        })

        if (response.ok) {
            setSuccess("Pomyślnie dodano łowisko")
            onNewLowisko(data);
            toast.success('Łowisko zostało dodane!')
        } else {
            setError('Wystąpił błąd przy dodawaniu łowiska')
            toast.error("Wystąpił błąd podczas dodawania łowiska")
        }
    }


    return (
        <div  className="LowiskoForm">
            {error && <p style={{color: "red"}}>{error}</p>}
            <form onSubmit={handleSubmit(onSubmit)} className="form-container">
                
                    <label id="Nazwa">Nazwa:</label>
                <input type="text" placeholder="Nazwa łowiska..." {...register("nazwa")}></input>
                {errors.nazwa && <p>{errors.nazwa.message}</p>}
                
                
                    <label>Typ </label>
                    <select id='typ' {...register('typ')}>
                        <option value ='' >Wybierz Typ</option>
                        <option value = 'jezioro'>Jezioro</option>
                        <option value = 'rzeka'>Rzeka</option>
                        <option value = 'staw'>Staw</option>
                        <option value = 'morze'>Morze</option>
                        <option value = 'kanał'>Kanał</option>
                    </select>
                    {errors.typ && <p>{errors.typ.message}</p>}
                
                
                    <label id='lokalizacja'>Lokalizacja: </label>
                    <input type="text" placeholder="Lokalizacja..." {...register('lokalizacja')}></input>
                    {errors.lokalizacja && <p>{errors.lokalizacja.message}</p>}
                
                
                    <label id='opis'>Opis: </label>
                    <input type='text' placeholder="Krótki opis łowiska" {...register('opis')}></input>
                
                
                    <label id='data_otwarcia'>Data otwarcia: </label>
                    <input type="date" {...register('data_otwarcia')}></input>
                    {errors.data_otwarcia && <p>{errors.data_otwarcia.message}</p>}
                
                <input type="submit" value = "dodaj łowisko"></input>
            </form>
        </div>
    )
}