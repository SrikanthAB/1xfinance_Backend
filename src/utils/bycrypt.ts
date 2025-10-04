
import bcrypt from "bcryptjs";  

/**
 * Hashes a password using bcrypt.
 * @param password - The password to hash.
 * @returns A promise that resolves to the hashed password.
 */
export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

/**
 * Compares a plain text password with a hashed password.
 * @param password - The plain text password to compare.
 * @param hashedPassword - The hashed password to compare against.
 * @returns A promise that resolves to a boolean indicating whether the passwords match.
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log("is<Match is here:",isMatch);
    return isMatch;
}