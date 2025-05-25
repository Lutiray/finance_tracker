import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styles from '@/pages/auth/AuthPage.module.scss';

const schema = yup.object().shape({
    email: yup.string().email('Incorrect email').required('Email is required'),
    password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
});

const LoginForm = ({ onSubmit, error }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {error && <div className={styles.apiError}>{error}</div>}

            <div className={styles.formGroup}>
                <input
                    type="email"
                    {...register('email')}
                    className={`${styles.input} ${errors.email ? styles.error : ''}`}
                    placeholder="Email"
                />
                {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}
            </div>

            <div className={styles.formGroup}>
                <input
                    type="password"
                    {...register('password')}
                    className={`${styles.input} ${errors.password ? styles.error : ''}`}
                    placeholder="Password"
                />
                {errors.password && <span className={styles.errorText}>{errors.password.message}</span>}
            </div>

            <button type="submit" className={styles.submitButton}>
                Log In
            </button>
        </form>
    );
};

export default LoginForm;