import React, { useState } from 'react';
import '../styles/SignUp.css';

function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        password: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Здесь можно добавить логику отправки данных на сервер
    };

    return (
        <div className="signup-container">
            <div className="signup-form">
                <h2>Регистрация</h2>
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
                        <label>Фамилия и имя</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder=""
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
                {showPassword ? '🐵' : '👁️'}
              </span>
                        </div>
                    </div>
                    <button type="submit" className="submit-button">
                        СОЗДАТЬ АККАУНТ
                    </button>
                </form>
                <div className="login-link">
                    <span>Уже есть аккаунт? </span>
                    <div>
                    </div>
                    <a href="/login">ВОЙТИ</a>
                </div>
            </div>
        </div>
    );
}

export default SignUp;