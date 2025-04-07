import { useForm } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from "react";


const schema = yup.object({
    username: yup.string().required("nazwa użytkownika jest wymagana"),
    email: yup.string().email('nieprawidłowy email').required('Email jest wymagany'),
    password: yup.string().min(4, 'Hasło musi mieć conajmniej 4 znaki').required("Hasło jest wymagane"),
    confirm_password: yup.string().min(4, 'Hasło musi mieć conajmniej 4 znaki').required("To pole jest wymagane").oneOf([yup.ref("password"), null], "hasłą nie są takie same")
})

export const RegisterForm = ({onRegisterSuccess}) => {
    const [errorMessage, setErrorMessage] = useState();
    const { register, handleSubmit, formState: { errors} } = useForm({
        resolver: yupResolver(schema),
    });

    // rejestracja w bazie
    const onSubmit = async (data) => {
        const response = await fetch('http://localhost:3002/api/register', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data)
        })
        if (response.ok) {
            onRegisterSuccess();
        } else {
            const errorData = await response.json();
            setErrorMessage(errorData.message);
            //alert(`${errorData.message}`)
        }
    }

    return (
        <div className="Register-Form">
            {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}
            <form onSubmit={handleSubmit(onSubmit)} className="form-container">
                <h2>Zarejestruj</h2>
                <label>Nazwa użytkownika:  </label>
                <input type="text" placeholder="nazwa użytkownika" {...register('username')}></input>
                <p>{errors.username?.message}</p>
                <label>Email:  </label>
                <input type="string" placeholder="rybak@gmail.com" {...register('email')}></input>
                <p>{errors.email?.message}</p>
                <label>Hasło:  </label>
                <input type="password" placeholder="******"{...register('password')}></input>
                <p>{errors.password?.message}</p>
                <label>Powtórz hasło:  </label>
                <input type="password" placeholder="powtórz hasło" {...register('confirm_password')}></input>
                <p>{errors.confirm_password?.message}</p>
                <input type="submit" value="Załóż konto"></input>
            </form>
        </div>
    )
}

    