export const getCredentialsFromUserData = (
  userData: string,
): { user: string; password: string } => {
  const cloudInitValuesStrings = userData
    ?.split('\n')
    ?.filter((row) => !row?.includes('#cloud-config'));

  const password = cloudInitValuesStrings
    ?.find((row) => row?.includes('password'))
    ?.split(': ')?.[1];

  const user = cloudInitValuesStrings?.find((row) => row?.includes('user'))?.split(': ')?.[1];

  return { user, password };
};
