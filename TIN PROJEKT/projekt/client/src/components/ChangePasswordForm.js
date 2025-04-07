import { useForm } from "react-hook-form";
import { useState } from "react";
import { useAuth } from "../AuthContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from 'yup';
import { toast } from 'react-toastify';

const schema = yup.object().shape({
    oldPassword: yup.string().min(4, "hasło musi mieć mieć minumum 4 znaki").required("To pole jest wymagane"),
    newPassword: yup.string().min(4, "Nowe hasło musi mieć minimum 4 znaki").required("To pole jest wymagane"),
    newPasswordConfirm: yup.string().oneOf([yup.ref('newPassword'), null], "hasła muszą się zgadzać").required("To pole jest wymagane")
})


export const ChangePasswordForm = ({setIsEdittingPassword}) => {
    const { register, handleSubmit, formState: {errors} } = useForm({
        resolver: yupResolver(schema)
    });
    const { userId } = useAuth();
    const [message, setMessage] = useState(""); 


    // zmiana hasla w bazie danych
    const onSubmit = async (data) => {
        const requestData = {
            userId: userId,
            oldPassword: data.oldPassword,
            newPassword: data.newPassword
        };

        try {
            const response = await fetch('http://localhost:3002/api/update-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (response.ok) {
                toast.success("Hasło zostało pomyślnie zaktualizowane.")
                setIsEdittingPassword(false)
            } else {
                setMessage(result.message || "Wystąpił błąd.");
            }
        } catch (error) {
            setMessage("Wystąpił błąd podczas próby zmiany hasła.");
        }
    };

    return (
        <div className="profile-chngPassword-Form">
            <form onSubmit={handleSubmit(onSubmit)}>
                <label>Stare hasło:</label>
                <input type="password" {...register('oldPassword',)} />
                {errors.oldPassword && <p>{errors.oldPassword?.message}</p>}
                
                <label>Nowe hasło:</label>
                <input type="password" {...register('newPassword', { required: "Nowe hasło jest wymagane" })} />
                {errors.newPassword && <p>{errors.newPassword?.message}</p>}
                <label>Powtórz nowe hasło:</label>
                <input type="password" {...register('newPasswordConfirm', { required: "Potwierdzenie hasła jest wymagane" })} />
                {errors.newPasswordConfirm && <p>{errors.newPasswordConfirm?.message}</p>}
                <button type="submit">Zmień hasło</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};
