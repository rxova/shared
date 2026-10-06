/** The settings page of the owner's app installation, or of all its installations when the id is unknown. */
export const installationPage = (owner: string, installationId: string | undefined): string =>
  `https://github.com/organizations/${owner}/settings/installations${
    installationId === undefined ? "" : `/${installationId}`
  }`;
