import { KMSClient, EncryptCommand, DecryptCommand } from "@aws-sdk/client-kms";

const kms = new KMSClient({});

export async function encryptWithKms(keyId: string, plaintext: string) {
    const command = new EncryptCommand({ KeyId: keyId, Plaintext: Buffer.from(plaintext, "utf8") });
    const res = await kms.send(command);
    if (!("CiphertextBlob" in res) || !res.CiphertextBlob) {
        throw new Error("KMS encryption failed: CiphertextBlob missing in response");
    }
    return res.CiphertextBlob;
}

export async function decryptWithKms(ciphertext: Buffer) {
    const command = new DecryptCommand({ CiphertextBlob: ciphertext });
    const res = await kms.send(command);
    return res.Plaintext?.toString();
}
