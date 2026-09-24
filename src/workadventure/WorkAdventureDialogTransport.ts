import {WorkAdventureApi} from "@workadventure/iframe-api-typings";

// avoiding zod to reduce bundle size of dialog.html from 800kb to 9kb
export interface DialogTransportRequest {
    readonly requestId: string;
    readonly avatar?: string;
    readonly title?: string;
    readonly message: string;
    readonly buttons: readonly {
        readonly label: string;
    }[];
    readonly typingDelay?: number;
}

export function isDialogTransportRequest(value: unknown): value is DialogTransportRequest {
    if (
        typeof value !== "object" ||
        value === null
    ) {
        return false;
    }

    const request = value as Record<string, unknown>;

    if (
        typeof request.requestId !== "string" ||
        typeof request.message !== "string" ||
        (request.title !== undefined && typeof request.title !== "string") ||
        (request.avatar !== undefined && typeof request.avatar !== "string") ||
        !Array.isArray(request.buttons) ||
        (request.typingDelay !== undefined && typeof request.typingDelay !== "number")
    ) {
        return false;
    }

    return request.buttons.every(
        (button) =>
            typeof button === "object" &&
            button !== null &&
            typeof (
                button as Record<string, unknown>
            ).label === "string",
    );
}

export interface DialogTransportResponse {
    readonly requestId: string;
    readonly buttonIndex: number;
}

export function isDialogTransportResponse(value: unknown): value is DialogTransportResponse {
    if (
        typeof value !== "object" ||
        value === null
    ) {
        return false;
    }

    const response = value as Record<string, unknown>;

    return (
        typeof response.requestId === "string" &&
        typeof response.buttonIndex === "number" &&
        Number.isInteger(response.buttonIndex) &&
        response.buttonIndex >= 0
    );
}

export const REQUEST_VARIABLE = "__lumrenion_workadventure_dialog_request";
export const RESPONSE_VARIABLE = "__lumrenion_workadventure_dialog_response";

export class WorkAdventureDialogTransport {
    public constructor(
        private readonly wa: WorkAdventureApi,
    ) {}

    public async sendRequest(request: DialogTransportRequest): Promise<void> {
        await this.wa.player.state.saveVariable(
            REQUEST_VARIABLE,
            request,
            {
                public: false,
                persist: false,
                scope: "room",
            },
        );
    }

    public onResponse(
        callback: (response: DialogTransportResponse) => void
    ): { unsubscribe(): void } {
        return this.wa.player.state
            .onVariableChange(RESPONSE_VARIABLE)
            .subscribe((value: unknown) => {
                if (isDialogTransportResponse(value)) {
                    callback(value);
                }
            });
    }

    public async clearRequest(): Promise<void> {
        await this.wa.player.state.saveVariable(
            REQUEST_VARIABLE,
            undefined,
            {
                public: false,
                persist: false,
                scope: "room",
            },
        );
    }

    public async clearResponse(): Promise<void> {
        await this.wa.player.state.saveVariable(
            RESPONSE_VARIABLE,
            undefined,
            {
                public: false,
                persist: false,
                scope: "room",
            },
        );
    }
}