import React from "react";

import { UserState } from "./user-state";

export default function UserProfileName() {
    const state = UserState.useContext();
    const displayName = state.displayName.use().current;
    return <p children={displayName} />;
}
