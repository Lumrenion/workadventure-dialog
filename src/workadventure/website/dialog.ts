import {
    REQUEST_VARIABLE,
    RESPONSE_VARIABLE,
    DialogTransportRequest,
} from "../WorkAdventureDialogTransport";
import { isDialogTransportRequest } from "../WorkAdventureDialogTransport";

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

function showDialog(request: DialogTransportRequest): void {
    if (avatarElement instanceof HTMLImageElement ) {
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

    messageElement!.textContent = request.message;
    buttonsElement!.replaceChildren();

    for (let index = 0; index < request.buttons.length; index++) {
        const button = request.buttons[index];

        const element = document.createElement("button");

        element.type = "button";
        element.textContent = button.label;

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
}

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