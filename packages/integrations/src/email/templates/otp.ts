export const otpTemplate = (verificationCode: string) => `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Código de verificación</h2>
                    <p>Tu código de verificación es:</p>
                    <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 4px;">${verificationCode}</h1>
                    </div>
                    <p>Este código expirará en 10 minutos.</p>
                    <p>Si no solicitaste este código, puedes ignorar este email.</p>
</div>`;