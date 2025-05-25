import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { login, register } from '@/api/authApi';
import styles from './AuthPage.module.scss';
import logo from '@/assets/logo.svg';
import Loader from '@/components/ui/Loader';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const navigate = useNavigate();

    const switchForm = () => {
        setApiError('');
        setIsLogin(!isLogin);
    };

    const handleAuthSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = isLogin
                ? await login(data)
                : await register(data);

            // Сохраняем токен и идем на Dashboard
            localStorage.setItem('token', response.token);
            toast.success(isLogin ? 'Login successful!' : 'Registration successful!');
            navigate('/dashboard');
        } catch (error) {
            const message = error?.response?.data?.message || 'Authentication failed';
            setApiError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.gradientBackground}>
                <div className={styles.logoSection}>
                    <img src={logo} alt="Finance App Logo" className={styles.logo} />
                    <h1 className={styles.title}>Finance App</h1>
                    <p className={styles.subtitle}>Manage your money with ease</p>
                </div>

                <div className={styles.formSection}>
                    <div className={styles.formContainer}>
                        <div className={styles.tabs}>
                            <button
                                className={`${styles.tab} ${isLogin ? styles.activeTab : ''}`}
                                onClick={switchForm}
                                disabled={isLoading}
                            >
                                Login
                            </button>
                            <button
                                className={`${styles.tab} ${!isLogin ? styles.activeTab : ''}`}
                                onClick={switchForm}
                                disabled={isLoading}
                            >
                                Sign Up
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'login' : 'register'}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {isLoading ? (
                                    <div className={styles.loaderContainer}>
                                        <Loader size={48} />
                                    </div>
                                ) : (
                                    <>
                                        {isLogin ? (
                                            <LoginForm
                                                onSubmit={handleAuthSubmit}
                                                error={apiError}
                                            />
                                        ) : (
                                            <RegisterForm
                                                onSubmit={handleAuthSubmit}
                                                error={apiError}
                                            />
                                        )}
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <div className={styles.footerLinks}>
                            {isLogin ? (
                                <a href="#forgot-password" className={styles.link}>
                                    Forgot password?
                                </a>
                            ) : (
                                <p className={styles.footerText}>
                                    Already have an account?{' '}
                                    <button
                                        onClick={switchForm}
                                        className={styles.linkButton}
                                        disabled={isLoading}
                                    >
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