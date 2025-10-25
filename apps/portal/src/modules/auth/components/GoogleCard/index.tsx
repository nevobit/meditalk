import { useState } from "react";
import styles from "./GoogleCard.module.css";
import { Button, Input, Tooltip, useForm } from "@mdi/design-system";
import { useLogin, useRegisterVerify } from "../../hooks";
import { useSession } from "@/shared";
import { Link, useNavigate } from "react-router-dom";

const GoogleIcon = () => (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.btnIcon}>
        <path
            d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.31 0-6-2.72-6-6.1s2.69-6.1 6-6.1c1.89 0 3.16.8 3.88 1.49L18 5.02C16.62 3.73 14.53 3 12 3 6.98 3 2.9 7.03 2.9 12s4.08 9 9.1 9c5.25 0 8.7-3.69 8.7-8.89 0-.6-.06-1.05-.14-1.51H12z"
            fill="black"
        />
    </svg>
);

const GoogleCard = () => {
    const { formState: { email, code }, handleChange } = useForm({
        email: "",
        code: ""
    });
    const [step, setStep] = useState<"email" | "codigo">("email");
    const { registerVerify: loginVerify, isVerifying } = useRegisterVerify();
    const { login, isLogging } = useLogin();
    const { signIn } = useSession();
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        login(email, {
            onSuccess: () => {
                setStep("codigo");
            },
        });
    };


    const handleRegisterVerify = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        loginVerify({ user: { email, emailVerifiedAt: new Date(), lastLoginAt: new Date() }, email, code }, {
            onSuccess: async (data) => {
                await signIn(data.token, data.accessToken, data.user);
                navigate("/");
            },

        });
    };

    return (
        <div className={styles.surface} >
            <div role="dialog" aria-labelledby="login-title" className={styles.card}>
                <header className={styles.header}>
                    <h1 id="login-title" className={styles.title}>Iniciar sesión</h1>
                    <p className={styles.subtitle}>Accede a tu espacio de trabajo</p>
                </header>
                <Tooltip content="Esta opción no está disponible en este momento" className={styles.tooltip}>
                    <div className={styles.tooltip}>
                        <button
                            type="button"
                            className={styles.btnNeutral}
                            aria-label="Continuar con Google"
                        >
                            <GoogleIcon />
                            Continuar con Google
                            {/* {loading ? "Conectando…" : "Continuar con Google"} */}
                        </button>

                        <div className={styles.divider} aria-hidden="true">
                            <hr className={styles.dividerLine} />
                            <span className={styles.dividerText}>O usa otro método</span>
                        </div>
                    </div>

                </Tooltip>

                {step === "email" && (
                    <form className={styles.form} noValidate onSubmit={handleLogin}>
                        <div>
                            <Input
                                label="Correo electrónico"
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoFocus
                                value={email}
                                onChange={handleChange}
                                placeholder="tu@clinica.com" />
                        </div>

                        <Button size="large" type="submit" disabled={isLogging} loading={isLogging} >
                            Continuar
                        </Button>
                    </form>
                )}

                {step === "codigo" && (
                    <form className={styles.form} noValidate onSubmit={handleRegisterVerify}>
                        <p className={styles.hint}>
                            Ingresa el código de 6 dígitos enviado a <strong>{email}</strong>
                        </p>

                        <Input label="Código" fullWidth name="code" id="code" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={code} onChange={handleChange} />

                        {/* {err && <p className={styles.error} role="alert">{err}</p>} */}
                        {/* {msg && <p className={styles.success}>{msg}</p>} */}

                        <Button type="submit" size="large" loading={isVerifying} >
                            Ingresar
                        </Button>

                        <div className={styles.row}>
                            <button type="button" className={styles.linkBtn} onClick={() => setStep("email")}>
                                Usar otro correo
                            </button>
                            <Button
                                type="button"
                                className={styles.linkBtn}
                                loading={isVerifying}
                            // onClick={reenviarCodigo}
                            // disabled={cooldown > 0}
                            // aria-disabled={cooldown > 0}
                            >
                                {/* {cooldown > 0 ? `Reenviar en ${cooldown}s` : "Reenviar código"} */}
                            </Button>
                        </div>
                    </form>
                )}
                <Link to="/signup" className={styles.linkBtn}>Registrarse</Link>
                <footer className={styles.footer}>
                    Al continuar, aceptas nuestros Términos y Política de Privacidad. • Los códigos expiran en 10 minutos.
                </footer>
            </div>
        </div>
    )
}

export default GoogleCard