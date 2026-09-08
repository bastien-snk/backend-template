import type { Page } from "@/systems/pagination";
import type { ResponseMapper } from "@/systems/mapper";
import type { CursorPageResponse } from "@/systems/pagination/response/cursor-page-response";

export class PageResponseMapper<Input, Output> implements ResponseMapper<
    Page<Input>,
    CursorPageResponse<Output>
> {
    constructor(private readonly itemMapper: ResponseMapper<Input, Output>) {}

    map(input: Page<Input>): CursorPageResponse<Output> {
        return {
            data: input.data.map((item) => this.itemMapper.map(item)),
            next_cursor: input.nextCursor,
            has_more: input.hasMore,
        };
    }
}
