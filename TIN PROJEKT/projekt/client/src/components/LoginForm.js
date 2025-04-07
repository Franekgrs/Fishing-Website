import { useForm } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../AuthContext";


const schema = yup.object().shape({
  email: yup.string().email("podaj poprawny adres email").required("Email jest wymagany"),
  password: yup.string().min(4, "Hasło musi mieć minimum 4 znaki").required("hasło jest wymagane")
})

export const LoginForm = ({onLoginSuccess}) => {
    const { register, handleSubmit, formState: {errors} } = useForm({
        resolver: yupResolver(schema)
    });
    const {login} = useAuth();
    const [errorMessage, setErrorMessage] = useState();

    // zalogowanie w bazie
    const onSubmit = async (data) => {
        const response = await fetch('http://localhost:3002/api/login', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data)
        });

        if (response.ok) {
            const { token } = await response.json();
            const userResponse = await fetch(`http://localhost:3002/api/user/${data.email}`);
            if (userResponse.ok) {
                const userData = await userResponse.json();
                login(userData.username, token, userData.id, userData.email)
                onLoginSuccess();
            } else {
                alert('Nie udało się pobrać danych użytkownika')
            }
        } else {
            const errorData = await response.json();
            setErrorMessage(errorData.message);
        }
    }

    return (
        <div className="login-Form">
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <form onSubmit={handleSubmit(onSubmit)} className="form-container">
                <label>Email:</label>
                <input type="text" placeholder="rybak@gmail.com" {...register('email')}></input>
                {errors.email && <p>{errors.email?.message}</p>}

                <label>Hasło:</label>
                <input type="password" {...register('password')}></input>
                {errors.password && <p>{errors.password?.message}</p>}
                <input type="submit" value="Gotowe"></input>
            </form>
        </div>
    )
}

    