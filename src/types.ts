export interface DialogButton<T> {
    label: string;
    value: T;
}

export interface DialogOptions<T> {
    avatar?: string;
    title?: string;
    message: string;
    buttons: DialogButton<T>[];
    typingDelay?: number;
}

export interface DialogController {
    show<T>(options: DialogOptions<T>): Promise<T>;
    close(): void;
}

export interface DialogService {
    show<T>(options: DialogOptions<T>): Promise<T>;
    close(): void;
    alert(message: string, title?: string, avatar?: string, typingDelay?: number): Promise<void>;
    confirm(message: string, title?: string, avatar?: string, typingDelay?: number): Promise<string>;
}