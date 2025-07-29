import forge from "node-forge";

export const encryptMnemonic = (phrase: string, password: string) => {
  const salt = forge.random.getBytesSync(16);
  const key = forge.pkcs5.pbkdf2(password, salt, 10000, 32);
  const iv = forge.random.getBytesSync(16);
  const cipher = forge.cipher.createCipher("AES-CBC", key);

  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(phrase));
  cipher.finish();

  const encrypted = cipher.output;

  return {
    encrypted: forge.util.encode64(encrypted.getBytes()),
    salt: forge.util.encode64(salt),
    iv: forge.util.encode64(iv),
  };
};

export const decryptMnemonic = (
  encrypted: string,
  salt: string,
  iv: string,
  password: string,
) => {
  const key = forge.pkcs5.pbkdf2(
    password,
    forge.util.decode64(salt),
    10000,
    32,
  );
  const decipher = forge.cipher.createDecipher("AES-CBC", key);

  decipher.start({ iv: forge.util.decode64(iv) });
  decipher.update(forge.util.createBuffer(forge.util.decode64(encrypted)));
  decipher.finish();

  return Buffer.from(decipher.output.getBytes(), "binary").toString("utf8");
};
