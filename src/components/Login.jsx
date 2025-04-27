import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Импортируем useNavigate
import '../styles/Login.css';

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const navigate = useNavigate(); // Для навигации

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Здесь должна быть логика авторизации
        navigate('/dashboard'); // Перенаправляем на дашборд
    };

    const handleSocialLogin = (provider) => {
        console.log(`Logging in with ${provider}`);
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Вход</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Электронная почта</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="myemail@gmail.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Пароль</label>
                        <div className="password-input">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder=""
                                required
                            />
                            <span
                                className="password-toggle"
                                onClick={togglePasswordVisibility}
                            >
                {showPassword ? '🙈' : '🙉'}
              </span>
                        </div>
                        <span className="reset-password">Сброс пароля</span>
                    </div>
                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            name="rememberMe"
                            checked={formData.rememberMe}
                            onChange={handleInputChange}
                        />
                        <label>Запомнить меня</label>
                    </div>
                    <div className="social-login">
                        <div className="social-login-text">
                            <span>Войти через</span>
                        </div>
                        <div className="social-buttons">
                            <button
                                type="button"
                                className="social-button google"
                                onClick={() => handleSocialLogin('Google')}
                            >
                                G
                            </button>
                            <button
                                type="button"
                                className="social-button github"
                                onClick={() => handleSocialLogin('GitHub')}
                            >
                                🐙
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="submit-button">
                        ВОЙТИ
                    </button>
                </form>
                <div className="signup-link">
                    <Link to="/signup">РЕГИСТРАЦИЯ</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;