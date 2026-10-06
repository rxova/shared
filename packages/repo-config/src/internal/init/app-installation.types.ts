/**
 * What `init` leaves to the user about an app installation: nothing
 * (`done`), installing the app on the organisation (`install`), or adding the
 * repository to the installation by hand (`configure`, with the installation's
 * id when init found it).
 */
export type AppInstallationStep =
  | { step: "done" }
  | { step: "install" }
  | { step: "configure"; installationId: string | undefined };
