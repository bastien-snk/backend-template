import { v7 as uuidv7 } from "uuid";
import type { IdGenerator } from "@/systems/id-generator/id-generator";

export class UuidV7IdGenerator implements IdGenerator {
    generate(): string {
        return uuidv7();
    }
}
