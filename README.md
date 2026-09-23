# Workadventure Dialog
This package is highly inspired by [workadventure/npc-dialog-box](https://github.com/workadventure/npc-dialog-box/).

The major difference is that this package is promise based. You can add any number of buttons to the dialog box, 
await a button click and work with the result.\

For now, it only supports a single message with a number of buttons. Optionally with a title (e.g. the name of an npc) 
and an image (e.g. the avatar of an npc).

## Usage
Install the package
```shell
npm install workdaventure-dialog
```

Add the Vite plugin to your map project's Vite config(s) — for the map-starter-kit,
both `web.vite.config.ts` and `buildmap.vite.config.ts`:

```ts
import { workAdventureDialog } from "workadventure-dialog/vite";

export default defineConfig({
    // ...
    plugins: [
        workAdventureDialog({ assets: ["npc-avatar.png"] }),
        // ...the other plugins (map optimizers, etc.)
    ],
});
```

It makes the dialog page available next to your map, in dev and in your build,
along with any extra files you list in `assets` (your avatar images, typically).

> [!Note]
> To add additional files, use recursive paths from the root directory, e.g. `./src/assets/npc-avatar.png`\
> The files will be added to the map build root directory. Use them as `npc-avatar.png`.

Initialize the dialog service. Then use the singleton instance to open and close dialogs:
```ts
import {WorkAdventureDialogService} from "@lumrenion/workadventure-dialog";

WorkAdventureDialogService.initialize(WA);

const dialogs = WorkAdventureDialogService.getInstance();
const buttonValue = await dialogs.show({
    message: "Are you ready for a WorkAdventure?",
    title: "Frank the Mayor",
    avatar: "npc-avatar.png",
    buttons: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" }
    ]
});

dialogs.close();
```

## Development hint
To publish a new version, execute:
```shell
npm version major|minor|patch
git push
git push --tags
```
`npm version` changes the version number in `package.json`, makes a commit and creates a git tag automatically.