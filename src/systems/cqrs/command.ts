export interface Command<InputT, OutputT> {
    execute(data: InputT): Promise<OutputT>;
}
