import stringify from "json-stable-stringify";
import type { ValueHasher } from "@/systems/hash/value-hasher";

export class StableValueHasher implements ValueHasher {
    hash(input: unknown): string {
        const payload = stringify(input) ?? "null";
        const hasher = new Bun.CryptoHasher("sha256");
        hasher.update(payload);
        return Buffer.from(hasher.digest()).toString("hex");
    }
}
