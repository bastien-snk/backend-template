import type { Logger } from "@/systems/logger";
import type { SecretManager } from "@/systems/secrets/secret-manager";
import { UuidV7IdGenerator, type IdGenerator } from "@/systems/id-generator";

type LocalSecrets = Record<string, unknown>;

export type LocalFileSecretManagerParams = {
    logger: Logger;
    filePath?: string;
    idGenerator?: IdGenerator;
};

export class LocalFileSecretManager implements SecretManager {
    private readonly filePath: string;
    private readonly logger: Logger;
    private readonly idGenerator: IdGenerator;

    private secrets: LocalSecrets | null | undefined;

    constructor(params: LocalFileSecretManagerParams) {
        this.filePath = params.filePath ?? ".local/secrets.json";
        this.logger = params.logger;
        this.idGenerator = params.idGenerator ?? new UuidV7IdGenerator();
        this.secrets = undefined;
    }

    async get(ref: string): Promise<string | null> {
        const secrets = await this.getSecrets();
        if (!secrets) return null;

        if (!(ref in secrets)) return null;
        const value = secrets[ref];
        if (value === undefined || value === null) return null;

        return typeof value === "string" ? value : JSON.stringify(value);
    }

    async create(value: string): Promise<string> {
        const secrets = (await this.getSecrets()) ?? {};
        const ref = `local/${this.idGenerator.generate()}`;
        secrets[ref] = value;
        this.secrets = secrets;
        await this.persistSecrets(secrets);
        return ref;
    }

    async delete(ref: string): Promise<void> {
        const secrets = await this.getSecrets();
        if (!secrets || !(ref in secrets)) return;
        delete secrets[ref];
        await this.persistSecrets(secrets);
    }

    private async getSecrets(): Promise<LocalSecrets | null> {
        if (this.secrets !== undefined) return this.secrets;

        this.secrets = await this.loadSecrets();
        return this.secrets;
    }

    private async loadSecrets(): Promise<LocalSecrets | null> {
        const file = Bun.file(this.filePath);
        const exists = await file.exists();
        if (!exists) {
            this.logger.debug("local secrets file not found", {
                filePath: this.filePath,
            });
            return null;
        }

        const raw = await file.text();
        if (raw.trim().length === 0) return {};

        let parsed: unknown;
        try {
            parsed = JSON.parse(raw);
        } catch {
            throw new Error(`invalid local secrets JSON: ${this.filePath}`);
        }

        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            throw new Error(
                `invalid local secrets payload in ${this.filePath}: expected object map`,
            );
        }

        return parsed as LocalSecrets;
    }

    private async persistSecrets(secrets: LocalSecrets): Promise<void> {
        await Bun.write(this.filePath, `${JSON.stringify(secrets, null, 2)}\n`);
    }
}
