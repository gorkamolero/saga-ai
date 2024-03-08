import { atom } from "jotai";
import { UserType } from "../validators/full-user";

const user = null;

const initUserOnboardingState = {
  ideas: 0,
  writers: 0,
  profile: 0,
};

export const userAtom = atom<UserType | null>(user);
export const userOnboarding = atom(initUserOnboardingState);
