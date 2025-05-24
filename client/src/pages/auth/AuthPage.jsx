import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import styles from './AuthPage.module.scss';
import logo from '../../assets/logo.svg';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();

    const loginSchema = yup.object().shape({
        email: yup.string().email('Incorrect email').required('Email is required'),
        password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
    });

    const registerSchema = yup.object().shape({
        email: yup.string().email('Incorrect email').required('Email is required'),
        password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
        confirmPassword: yup
            .string()
            .oneOf([yup.ref('password'), null], 'Passwords must match')
            .required('Confirm password is required'),
    });

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(isLogin ? loginSchema : registerSchema),
    });

    const onSubmit = async (data) => {
        try {
            // Здесь будет реальный вызов API
            console.log('Form data:', data);
            toast.success(isLogin ? 'Login successful!' : 'Registration successful!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred');
        }
    };

    const switchForm = () => {
        reset();
        setIsLogin(!isLogin);
    };

    return (
        <div className={styles.container}>
            <div className={styles.gradientBackground}>
                {/* Логотип и заголовок */}
                <div className={styles.logoSection}>
                    <img src={logo} alt="Finance App Logo" className={styles.logo} />
                    <h1 className={styles.title}>Finance App</h1>
                    <p className={styles.subtitle}>Manage your money with ease</p>
                </div>

                {/* Форма авторизации */}
                <div className={styles.formSection}>
                    <div className={styles.formContainer}>
                        {/* Переключатель между Login/Sign Up */}
                        <div className={styles.tabs}>
                            <button
                                className={`${styles.tab} ${isLogin ? styles.activeTab : ''}`}
                                onClick={switchForm}
                            >
                                Login
                            </button>
                            <button
                                className={`${styles.tab} ${!isLogin ? styles.activeTab : ''}`}
                                onClick={switchForm}
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Анимированная форма */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'login' : 'register'}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                                    <div className={styles.formGroup}>
                                        <input
                                            type="email"
                                            className={`${styles.input} ${errors.email ? styles.errorInput : ''}`}
                                            placeholder="Email"
                                            {...register('email')}
                                        />
                                        {errors.email && (
                                            <span className={styles.errorText}>{errors.email.message}</span>
                                        )}
                                    </div>

                                    <div className={styles.formGroup}>
                                        <input
                                            type="password"
                                            className={`${styles.input} ${errors.password ? styles.errorInput : ''}`}
                                            placeholder="Password"
                                            {...register('password')}
                                        />
                                        {errors.password && (
                                            <span className={styles.errorText}>{errors.password.message}</span>
                                        )}
                                    </div>

                                    {!isLogin && (
                                        <div className={styles.formGroup}>
                                            <input
                                                type="password"
                                                className={`${styles.input} ${errors.confirmPassword ? styles.errorInput : ''}`}
                                                placeholder="Confirm Password"
                                                {...register('confirmPassword')}
                                            />
                                            {errors.confirmPassword && (
                                                <span className={styles.errorText}>{errors.confirmPassword.message}</span>
                                            )}
                                        </div>
                                    )}

                                    <button type="submit" className={styles.submitButton}>
                                        {isLogin ? 'Login' : 'Sign Up'}
                                    </button>
                                </form>
                            </motion.div>
                        </AnimatePresence>

                        {/* Ссылки внизу формы */}
                        <div className={styles.footerLinks}>
                            {isLogin ? (
                                <a href="#forgot-password" className={styles.link}>
                                    Forgot password?
                                </a>
                            ) : (
                                <p className={styles.footerText}>
                                    Already have an account?{' '}
                                    <button onClick={switchForm} className={styles.linkButton}>
                                        Login
                                    </button>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;