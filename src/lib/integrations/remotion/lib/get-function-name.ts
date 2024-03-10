import { VERSION } from "remotion";

import { RAM, DISK, TIMEOUT } from "./constants";

export const speculateFunctionName = () => `remotion-render-${VERSION.replace(
		/\./g,
		"-",
	)}-mem${RAM}mb-disk${DISK}mb-${TIMEOUT}sec`;
