import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styles from '@/pages/auth/AuthPage.module.scss';

const schema = yup.object().shape({
    email: yup.string().email('Invalid email format').required('Email is required'),
    password: yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[0-9]/, 'Password must contain at least one number')
        .required('Password is required'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your password'),
    agreeTerms: yup.boolean()
        .oneOf([true], 'You must accept the terms and conditions')
});

const RegisterForm = ({ onSubmit, error }) => {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema)
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {error && <div className={styles.apiError}>{error}</div>}

            <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={`${styles.input} ${errors.email ? styles.error : ''}`}
                    placeholder="your@email.com"
                    autoComplete="username"
                />
                {errors.email && (
                    <span className={styles.errorText}>{errors.email.message}</span>
                )}
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>Password</label>
                <input
                    id="password"
                    type="password"
                    {...register('password')}
                    className={`${styles.input} ${errors.password ? styles.error : ''}`}
                    placeholder="••••••••"
                    autoComplete="new-password"
                />
                {errors.password && (
                    <span className={styles.errorText}>{errors.password.message}</span>
                )}
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                <input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword')}
                    className={`${styles.input} ${errors.confirmPassword ? styles.error : ''}`}
                    placeholder="••••••••"
                    autoComplete="new-password"
                />
                {errors.confirmPassword && (
                    <span className={styles.errorText}>{errors.confirmPassword.message}</span>
                )}
            </div>

            <div className={styles.checkboxGroup}>
                <input
                    id="agreeTerms"
                    type="checkbox"
                    {...register('agreeTerms')}
                    className={styles.checkbox}
                />
                <label htmlFor="agreeTerms" className={styles.checkboxLabel}>
                    I agree to the <a href="#terms" className={styles.link}>Terms and Conditions</a>
                </label>
                {errors.agreeTerms && (
                    <span className={styles.errorText}>{errors.agreeTerms.message}</span>
                )}
            </div>

            <button type="submit" className={styles.submitButton}>
                Create Account
            </button>
        </form>
    );
};

export default RegisterForm;