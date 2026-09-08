export interface Query<InputT, OutputT> {
    execute(data: InputT): Promise<OutputT>;
}
