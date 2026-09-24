import { WorkAdventureApi } from "@workadventure/iframe-api-typings";

import type { DialogController, DialogOptions } from "../types";

import { WorkAdventureDialogTransport } from "./WorkAdventureDialogTransport";

export interface WorkAdventureDialogOptions {
    readonly url?: string;

    readonly width?: string;
    readonly height?: string;
}

type UIWebsite = Awaited<ReturnType<typeof WA.ui.website.open>>;

export class WorkAdventureDialogController implements DialogController {
    private website?: UIWebsite;

    private responseSubscription?: {
        unsubscribe(): void;
    };

    public constructor(
        private readonly wa: WorkAdventureApi,
        private readonly transport: WorkAdventureDialogTransport,
        private readonly options: WorkAdventureDialogOptions,
    ) {}

    public async show<T>(options: DialogOptions<T>): Promise<T> {
        if (this.website) {
            await this.close();
        }

        const requestId = crypto.randomUUID();

        const response = new Promise<T>(
            (resolve, reject) => {
                this.responseSubscription =
                    this.transport.onResponse(
                        (response) => {
                            if (response.requestId !== requestId) {
                                return;
                            }

                            this.responseSubscription?.unsubscribe();
                            this.responseSubscription = undefined;

                            const button =
                                options.buttons[
                                    response.buttonIndex
                                    ];

                            if (!button) {
                                reject(
                                    new Error(
                                        `Dialog returned invalid button index: ${response.buttonIndex}`,
                                    ),
                                );

                                return;
                            }

                            resolve(button.value);

                            this.close();
                        },
                    );
            },
        );

        await this.transport.clearResponse();

        function getDialogSize() {
            // The dialog CSS has a breakpoint at 600px. For a dialog width of 80vw, this is 750px
            const isMobile = window.outerWidth <= 750;
            let width = '80vw';
            let height = options.avatar || options.title ? '230px' : '170px';

            if (isMobile) {
                const padding = 64;
                const buttonsSpace = 36 * options.buttons.length + 12 * (options.buttons.length-1)
                const textMinSpace = (options.avatar || options.title) ? 120 : 70;
                if (window.outerHeight <= (padding + buttonsSpace + textMinSpace)) {
                    height = '80vh';
                } else {
                    height = `${padding + buttonsSpace + textMinSpace}px`
                }
            }

            return {width, height};
        }

        const size = getDialogSize();

        this.website =
            await this.wa.ui.website.open({
                url: this.options.url ?? "/dialog.html",
                visible: true,
                allowApi: true,
                allowPolicy: "",
                position: {
                    vertical: "bottom",
                    horizontal: "middle",
                },
                size: {
                    width: this.options.width ?? size.width,
                    height: this.options.height ?? size.height,
                },
                margin: {
                    bottom: "1rem",
                },
            });

        await this.transport.sendRequest({
            requestId,
            avatar: options.avatar ?? undefined,
            title: options.title ?? undefined,
            message: options.message,
            buttons: options.buttons.map(
                ({ label }) => ({
                    label,
                }),
            ),
            typingDelay: options.typingDelay ?? undefined,
        });

        return response;
    }

    public async close(): Promise<void> {
        this.responseSubscription?.unsubscribe();
        this.responseSubscription = undefined;

        await this.transport.clearRequest();

        if (this.website) {
            await this.website.close();
            this.website = undefined;
        }
    }
}