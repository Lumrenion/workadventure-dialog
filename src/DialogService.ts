import type {
    DialogController,
    DialogOptions,
    DialogService as IDialogService,
} from "./types";

export class DialogService implements IDialogService {
    public constructor(
        private readonly controller: DialogController,
    ) {}

    public show<T>(options: DialogOptions<T>): Promise<T> {
        return this.controller.show(options);
    }

    public close(): void {
        return this.controller.close();
    }

    public alert(message: string, title?: string, avatar?: string): Promise<void> {
        return this.controller.show({
            message,
            title,
            avatar,
            buttons: [
                {
                    label: "OK",
                    value: undefined,
                },
            ],
        });
    }

    public confirm(message: string, title?: string, avatar?: string): Promise<string> {
        return this.controller.show({
            message,
            title,
            avatar,
            buttons: [
                {
                    label: "Yes",
                    value: "true",
                },
                {
                    label: "No",
                    value: "false",
                },
            ],
        });
    }
}