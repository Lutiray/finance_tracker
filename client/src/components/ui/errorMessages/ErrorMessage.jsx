import styles from './ErrorMessage.module.scss';

const ErrorMessage = ({ error }) => {
    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Error occurred</h3>
            <p className={styles.message}>{error.message}</p>
            <button
                className={styles.button}
                onClick={() => window.location.reload()}
            >
                Refresh Page
            </button>
        </div>
    );
};

export default ErrorMessage;