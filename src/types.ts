export interface DialogButton<T> {
    label: string;
    value: T;
}

export interface DialogOptions<T> {
    avatar?: string;
    title?: string;
    message: string;
    buttons: DialogButton<T>[];
}

export interface DialogController {
    show<T>(options: DialogOptions<T>): Promise<T>;
    close(): void;
}

export interface DialogService {
    show<T>(options: DialogOptions<T>): Promise<T>;
    close(): void;
    alert(message: string): Promise<void>;
    confirm(message: string): Promise<string>;
}