import {
    REQUEST_VARIABLE,
    RESPONSE_VARIABLE,
    DialogTransportRequest,
} from "../WorkAdventureDialogTransport";
import { isDialogTransportRequest } from "../WorkAdventureDialogTransport";
import {request} from "node:http";

const dialogElement =
    document.getElementById("dialog_box")

const avatarElement =
    document.getElementById("avatar");

const titleElement =
    document.getElementById("title");

const messageElement =
    document.getElementById("message");

const buttonsElement =
    document.getElementById("buttons");

if (
    !(messageElement instanceof HTMLElement) ||
    !(buttonsElement instanceof HTMLElement)
) {
    throw new Error(
        "Dialog HTML is missing required elements.",
    );
}

/**
 * Characters per second.
 */
let TYPING_DELAY = 35;

function getTypingDelay(character: string): number {
    switch (character) {
        case ".":
        case "!":
        case "?":
            return 300;

        case ",":
        case ";":
        case ":":
            return 150;

        default:
            return TYPING_DELAY;
    }
}

let typingTimer: number | undefined;
let cancelTyping: (() => void) | undefined;

function typeMessage(
    element: HTMLElement,
    message: string,
): Promise<void> {
    cancelTyping?.();

    return new Promise<void>((resolve) => {
        let index = 0;
        let cancelled = false;

        const finish = () => {
            element.textContent = message;
            typingTimer = undefined;
            cancelTyping = undefined;
            resolve();
        }

        cancelTyping = () => {
            cancelled = true;

            if (typingTimer !== undefined) {
                clearTimeout(typingTimer);
                typingTimer = undefined;
            }

            finish();
        }

        const typeNextCharacter = () => {
            if (cancelled) {
                return;
            }

            if (index >= message.length) {
                finish();
                return;
            }

            element.textContent = message.substring(0, ++index);

            typingTimer = window.setTimeout(typeNextCharacter, getTypingDelay(message[index - 1]));
        };

        typeNextCharacter();
    });
}

async function showDialog(request: DialogTransportRequest): Promise<void> {
    if (request.typingDelay) {
        TYPING_DELAY = request.typingDelay;
    }
    if (avatarElement instanceof HTMLImageElement) {
        if (!request.avatar) {
            avatarElement.hidden = true;
        } else {
            avatarElement.src = request.avatar;
            avatarElement.hidden = false;
        }
    }

    if (titleElement instanceof HTMLElement) {
        if (!request.title) {
            titleElement.hidden = true;
        } else {
            titleElement.textContent = request.title;
            titleElement.hidden = false;
        }
    }

    buttonsElement!.replaceChildren();

    for (let index = 0; index < request.buttons.length; index++) {
        const button = request.buttons[index];

        const element = document.createElement("button");

        element.type = "button";
        element.textContent = button.label;
        element.disabled = true;

        element.addEventListener(
            "click",
            () => {
                void WA.player.state.saveVariable(
                    RESPONSE_VARIABLE,
                    {
                        requestId: request.requestId,
                        buttonIndex: index,
                    },
                    {
                        public: false,
                        persist: false,
                        scope: "room",
                    },
                );
            },
            { once: true },
        );

        buttonsElement!.appendChild(element);
    }

    await typeMessage(messageElement!, request.message);

    for (const element of buttonsElement!.children) {
        if (element instanceof HTMLButtonElement) {
            element.disabled = false;
        }
    }
}

dialogElement!.addEventListener(
    "click",
    () => {
        cancelTyping?.();
    },
);

window.addEventListener("load", () => {
    WA.onInit()
        .then(() => {
            WA.player.state
                .onVariableChange(REQUEST_VARIABLE)
                .subscribe((value: unknown) => {
                    if (isDialogTransportRequest(value)) {
                        showDialog(value);
                    }
                });

            /*
             * The iframe may already have been loaded after the
             * controller wrote the request. Check the current value
             * as well.
             */
            const request = WA.player.state[REQUEST_VARIABLE];

            if (isDialogTransportRequest(request)) {
                showDialog(request);
            }
        })
        .catch((error) => {
            console.error(
                "Failed to initialize dialog.",
                error,
            );
        });
});