import type {Actor} from "@/systems/authentication/actor";

export interface ActorResolver {
  resolve(request: Request): Promise<Actor | null>;
}
