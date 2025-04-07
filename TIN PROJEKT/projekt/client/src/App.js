import './styles/App.css';
import './styles/Forms.css';
import './styles/HomePage.css';
import './styles/LowiskaPage.css';
import './styles/LowiskoDetails.css';
import './styles/ProfilePage.css'
import './styles/GaleriaPage.css'
import './styles/OpiniePage.css'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { NotFoundPage } from './pages/NotFoundPage';
import { HomePage } from './pages/HomePage';
import { LowiskaPage } from './pages/LowiskaPage';
import { LowiskoDetails } from './components/LowiskoDetails';
import { useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { AuthProvider, useAuth } from './AuthContext';
import { ProfilePage } from './pages/ProfilePage';
import { OpiniePage } from './pages/OpiniePage';
import { GaleriaPage } from './pages/GaleriaPage';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { isLoggedIn, username, login, logout } = useAuth();
  const [activeModal, setActiveModal] = useState(null);
  const navigate = useNavigate();

  const handleLogin = () => {
    setActiveModal('login');
  };

  const handleRegister = () => {
    setActiveModal('register');
  };

  const handleLogout = () => {
    logout();
    setActiveModal(null);
    toast.success("Zostałeś pomyślnie wylogowany!");
    navigate('/');
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleLoginSuccess = () => {
    setActiveModal(null);
    toast.success("Pomyślnie zalogowano!");
  };

  const handleRegisterSuccess = () => {
    setActiveModal(null);
    toast.success("Pomyślnie zarejestrowano!");
  };

  return (
    <div className="App">
      <header>
        <Link to="/" className="logo">Wędkuj.pl</Link>
        <nav>
          <ul>
            <li><Link to="/">Strona główna</Link></li>
            <li><Link to="/lowiska">Łowiska</Link></li>
            <li><Link to="/opinie">Opinie</Link></li>
            <li><Link to="/galeria">Galeria</Link></li>
          </ul>
        </nav>
        <div className="auth-buttons">
          {!isLoggedIn ? (
            <>
              {username ? (<p>Zalogowano jako: {username}</p>) : (<p></p>)}
              <button onClick={handleLogin} className='btn-green'>Zaloguj</button>
              <button onClick={handleRegister} className='btn-green'>Zarejestruj</button>
            </>
          ) : (
            <div className='logged-in-container'>
              <p>Zalogowano jako: {username}</p>
              <Link to='/profile' className='profile-button'>Pokaż profil</Link>
              <button onClick={handleLogout} className='btn-red'>Wyloguj</button>
            </div>
          )}
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lowiska" element={<LowiskaPage />} />
          <Route path='/lowiska/:id' element={<LowiskoDetails />} />
          <Route path='/profile' element={<ProfilePage />}></Route>
          <Route path="/opinie" element={<OpiniePage />} />
          <Route path="/galeria" element={<GaleriaPage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/not-found" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer>
        <p>&copy; 2024 Wędkuj.pl. Wszystkie prawa zastrzeżone. | <a href="#">Polityka prywatności</a></p>
      </footer>
      {activeModal && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-modal" onClick={closeModal}>X</button>
            {activeModal === 'login' && <LoginForm onLoginSuccess={handleLoginSuccess} />}
            {activeModal === 'register' && <RegisterForm onRegisterSuccess={handleRegisterSuccess} />}
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={1000}/>
    </div>
  );
}

export default App;
