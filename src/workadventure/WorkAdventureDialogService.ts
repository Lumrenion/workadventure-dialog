import { DialogService } from "../DialogService";
import type { DialogController } from "../types";
import { WorkAdventureDialogController, type WorkAdventureDialogOptions } from "./WorkAdventureDialogController";
import { WorkAdventureDialogTransport } from "./WorkAdventureDialogTransport";
import { WorkAdventureApi } from "@workadventure/iframe-api-typings";

export class WorkAdventureDialogService extends DialogService {
    private static instance?: WorkAdventureDialogService;

    private constructor(controller: DialogController) {
        super(controller);
    }

    public static initialize(
        wa: WorkAdventureApi,
        options: WorkAdventureDialogOptions = {},
    ): WorkAdventureDialogService {
        if (this.instance) {
            throw new Error(
                "WorkAdventureDialogService has already been initialized.",
            );
        }

        const transport = new WorkAdventureDialogTransport(wa);

        const controller = new WorkAdventureDialogController(wa, transport, options);

        this.instance = new WorkAdventureDialogService(controller);

        return this.instance;
    }

    public static getInstance(): WorkAdventureDialogService {
        if (!this.instance) {
            throw new Error(
                "WorkAdventureDialogService has not been initialized.",
            );
        }

        return this.instance;
    }
}